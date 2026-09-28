// src/components/lesson/LessonOverview/LessonOverview.tsx
// Обзор пройденного урока (решение пользователя 28.09.2026): этапы урока по
// порядку — ситуацию и теорию можно перечитать, тест и мини-игру —
// перепройти (лучшая попытка засчитывается; без ошибок везде — звезда),
// событие уже решено. Сверху — есть ли у урока звезда.

import { Ionicons } from '@expo/vector-icons';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { ScreenFooter } from '@/components/ui';
import { LessonEventContent } from '@/domain/content/LessonContent';
import { LessonPlan, PlanActivity, PlanNode } from '@/domain/lesson/LessonPlan';
import { LessonProgressState, hasStar } from '@/domain/lesson/lessonProgress';
import { pluralize } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import type { IconName } from '@/types/icons';
import { createLessonOverviewStyles } from './LessonOverview.styles';

const MINIGAME_NAMES: Record<string, string> = {
  quiz: 'Викторина',
  tinder_swipe: 'Свайпы',
  five_letters: '5 букв',
};

function activityRow(
  activity: PlanActivity,
  event: LessonEventContent | null
): { icon: IconName; label: string } {
  const { content } = activity;
  if (content.type === 'test') {
    const count = content.questions.length;
    return {
      icon: 'help-circle-outline',
      label: `Тест · ${count} ${pluralize(count, 'вопрос', 'вопроса', 'вопросов')}`,
    };
  }
  if (content.type === 'minigame') {
    return {
      icon: 'game-controller-outline',
      label: `Мини-игра «${MINIGAME_NAMES[content.minigame_type] ?? 'Игра'}»`,
    };
  }
  return { icon: 'flash-outline', label: `Событие: ${event?.title ?? 'выбор'}` };
}

export function LessonOverview({
  plan,
  progress,
  eventFor,
  onOpenReading,
  onOpenActivity,
  onOpenConclusion,
  onClose,
}: {
  plan: LessonPlan;
  progress: LessonProgressState;
  /** Событие, которое выпало в этом действии (для подписи). */
  eventFor: (activity: PlanActivity) => LessonEventContent | null;
  onOpenReading: (node: PlanNode) => void;
  onOpenActivity: (activity: PlanActivity) => void;
  onOpenConclusion: () => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLessonOverviewStyles({ theme });
  const starred = hasStar(progress);

  const renderRow = (
    key: string,
    icon: IconName,
    label: string,
    status: string | null,
    action: { label: string; onPress: () => void } | null
  ) => (
    <TouchableOpacity
      key={key}
      onPress={action?.onPress}
      disabled={!action}
      activeOpacity={0.8}
      style={styles.row}
      accessibilityRole={action ? 'button' : undefined}
      accessibilityLabel={[label, status, action?.label].filter(Boolean).join('. ')}
    >
      <Ionicons name={icon} size={scale(22)} color={theme.primary} />
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { fontSize: scaledFont('lg') }]}>{label}</Text>
        {status && <Text style={[styles.rowStatus, { fontSize: scaledFont('md') }]}>{status}</Text>}
      </View>
      {action && (
        <Text style={[styles.rowAction, { fontSize: scaledFont('md') }]}>{action.label}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { fontSize: scaledFont('xxl') }]} accessibilityRole="header">
          {plan.title}
        </Text>
        <View style={[styles.starCard, starred && styles.starCardEarned]}>
          <Text style={[styles.starText, { fontSize: scaledFont('md') }]}>
            {starred
              ? '★ Урок пройден идеально'
              : '☆ Пройди все тесты и игры урока без ошибок — и у урока появится звезда'}
          </Text>
        </View>

        {plan.nodes.map((node) => (
          <View key={node.index} style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: scaledFont('md') }]}>
              Этап {node.index + 1}
            </Text>
            {renderRow(
              `reading-${node.index}`,
              'book-outline',
              node.situation ? 'Ситуация и теория' : 'Теория',
              null,
              { label: 'Перечитать', onPress: () => onOpenReading(node) }
            )}
            {node.activities.map((activity) => {
              const result = progress.results[activity.id];
              const { icon, label } = activityRow(activity, eventFor(activity));
              if (activity.content.type === 'event') {
                return renderRow(activity.id, icon, label, result ? 'решено' : null, null);
              }
              const status = result?.perfect
                ? '★ без ошибок'
                : result?.completed
                  ? '✓ пройдено, были ошибки'
                  : null;
              return renderRow(activity.id, icon, label, status, {
                label: 'Перепройти',
                onPress: () => onOpenActivity(activity),
              });
            })}
          </View>
        ))}

        {plan.conclusion && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: scaledFont('md') }]}>Финал</Text>
            {renderRow('conclusion', 'flag-outline', plan.conclusion.title, null, {
              label: 'Перечитать',
              onPress: onOpenConclusion,
            })}
          </View>
        )}
      </ScrollView>

      <ScreenFooter>
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          style={styles.closeButton}
          accessibilityRole="button"
        >
          <Text style={[styles.closeButtonText, { fontSize: scaledFont('lg') }]}>Готово</Text>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
