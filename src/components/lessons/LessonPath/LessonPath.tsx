// src/components/lessons/LessonPath/LessonPath.tsx
// Дорожка уроков ветки: изогнутая SVG-линия + чередующиеся по бокам узлы
// (уроки и узлы-подарки). «Удобный динамический компонент, который правильно
// выводит уроки в зависимости от структуры» — items уже содержит и уроки, и
// подарки в нужном порядке (см. domain/lesson/buildLessonPath.ts), этот
// компонент просто их раскладывает.
//
// Раскладка — фиксированная высота строки на узел + чередующееся смещение по
// x от индекса строки (не через измерение layout — проще и надёжнее). SVG-
// слой рисует один <Path> по тем же координатам центров узлов, что гарантирует
// совпадение линии и кружков.

import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { LessonPathNode } from '@/domain/lesson/LessonPathNode';
import { Lesson, LessonProgress } from '@/lib/hooks/useLessons';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { GiftPathNode } from '../GiftPathNode';
import { LessonNode } from '../LessonNode';
import { createLessonPathStyles } from './LessonPath.styles';

const ROW_HEIGHT = 110;
const CIRCLE_SIZE = 60;
const SWING = 48;

function itemKey(item: LessonPathNode): string {
  return item.type === 'lesson' ? `lesson-${item.lesson.id}` : `gift-${item.node.id}`;
}

export function LessonPath({
  items,
  progress,
  isLessonAvailable,
  branchColor,
  isPriority,
  onPressLesson,
  footer,
  containerWidth,
}: {
  items: LessonPathNode[];
  progress: Record<number, LessonProgress>;
  isLessonAvailable: (lessonId: number) => boolean;
  branchColor: string;
  isPriority: boolean;
  onPressLesson: (lesson: Lesson) => void;
  footer?: ReactNode;
  /** Ширина колонки, в которой рендерится дорожка (без бокового паддинга) —
   * при вертикальной раскладке веток слева это не вся ширина экрана. */
  containerWidth: number;
}) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const styles = createLessonPathStyles({ theme });

  const circleSize = scale(CIRCLE_SIZE);
  const rowHeight = scale(ROW_HEIGHT);
  const gap = scale(spacing.sm);
  const pathWidth = Math.max(containerWidth - scale(spacing.lg) * 2, circleSize + 80);
  const centerX = pathWidth / 2;
  // Размах зигзага и макс. ширина подписи считаются от реально доступной
  // pathWidth, а не от фиксированных констант — иначе на узкой колонке
  // (например, когда слева занята рельса режима) подпись урока вылезает за
  // край экрана вместо того, чтобы просто перенестись на новую строку.
  const swing = Math.min(scale(SWING), pathWidth * 0.16);
  const labelMaxWidth = Math.max(44, centerX - swing - circleSize / 2 - gap);

  const xAt = (i: number) => centerX + (i % 2 === 0 ? -swing : swing);
  const yAt = (i: number) => i * rowHeight + rowHeight / 2;

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>В этой теме пока нет уроков</Text>
        <Text style={styles.emptyText}>Новые уроки скоро появятся!</Text>
      </View>
    );
  }

  const totalHeight = items.length * rowHeight;

  let pathD = `M ${xAt(0)},${yAt(0)}`;
  for (let i = 1; i < items.length; i++) {
    const x0 = xAt(i - 1);
    const y0 = yAt(i - 1);
    const x1 = xAt(i);
    const y1 = yAt(i);
    const midY = y0 + (y1 - y0) / 2;
    pathD += ` C ${x0},${midY} ${x1},${midY} ${x1},${y1}`;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.pathContainer, { height: totalHeight }]}>
        <Svg width={pathWidth} height={totalHeight} style={styles.svgLayer}>
          <Path
            d={pathD}
            stroke={theme.surfaceLight}
            strokeWidth={scale(4)}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>

        {items.map((item, i) => {
          const cx = xAt(i);
          const cy = yAt(i);
          const slotStyle = {
            left: cx - circleSize / 2,
            top: cy - circleSize / 2,
          };

          if (item.type === 'gift') {
            return (
              <View key={itemKey(item)} style={[styles.nodeSlot, slotStyle]}>
                <GiftPathNode node={item.node} />
              </View>
            );
          }

          const lesson = item.lesson;
          const lessonProgress = progress[lesson.id];
          const isCompleted = lessonProgress?.status === 'completed';
          const isAvailable = isLessonAvailable(lesson.id);
          const isCurrent = isAvailable && !isCompleted;

          return (
            <View key={itemKey(item)} style={[styles.nodeSlot, slotStyle]}>
              <LessonNode
                lesson={lesson}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isAvailable={isAvailable}
                branchColor={branchColor}
                isPriority={isPriority}
                infoAlign={i % 2 === 0 ? 'right' : 'left'}
                labelMaxWidth={labelMaxWidth}
                onPress={() => onPressLesson(lesson)}
              />
            </View>
          );
        })}
      </View>

      {footer}
    </ScrollView>
  );
}
