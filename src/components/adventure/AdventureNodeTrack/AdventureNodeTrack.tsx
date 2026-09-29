// src/components/adventure/AdventureNodeTrack/AdventureNodeTrack.tsx
// Трек этапов урока смены (макет «Работа», 28.09.2026): кружки этапов,
// соединённые линией. Первый — «Теория» (решение 29.09.2026), дальше этапы
// заданий. Пройденный — зелёный с галочкой, текущий — фиолетовый с иконкой
// типа, будущие — серые с иконкой; последний — флажок финиша: только
// отметка, не кнопка (заключение и итоги идут сразу после последнего этапа).
// Пройденный этап можно открыть — перечитать и перепройти; текущий —
// продолжить. Состояние передают и иконка, и подпись для скринридера (§23).

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import { LessonNodeKind, LessonPlan } from '@/domain/lesson/LessonPlan';
import {
  LessonProgressState,
  currentPosition,
  isNodeComplete,
} from '@/domain/lesson/lessonProgress';
import { useResponsive, useTheme } from '@/theme';
import type { IconName } from '@/types/icons';
import { createAdventureNodeTrackStyles } from './AdventureNodeTrack.styles';

export const NODE_KIND_ICONS: Record<LessonNodeKind, IconName> = {
  theory: 'book',
  test: 'help-circle',
  minigame: 'game-controller',
  event: 'flash',
};

const NODE_KIND_NAMES: Record<LessonNodeKind, string> = {
  theory: 'теория',
  test: 'тест',
  minigame: 'мини-игра',
  event: 'событие',
};

type NodeState = 'done' | 'current' | 'future';

export function AdventureNodeTrack({
  plan,
  progress,
  onPressNode,
}: {
  plan: LessonPlan;
  progress: LessonProgressState;
  /** Индекс этапа; plan.nodes.length — финальный (завершение урока). */
  onPressNode: (index: number) => void;
}) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const styles = createAdventureNodeTrackStyles({ theme });

  const position = currentPosition(plan, progress);
  const currentIndex =
    position.kind === 'reading' || position.kind === 'activity'
      ? position.node.index
      : position.kind === 'final'
        ? plan.nodes.length
        : -1;

  const stateOf = (index: number): NodeState => {
    const done =
      index < plan.nodes.length ? isNodeComplete(plan, progress, index) : !!progress.completedAt;
    if (done) return 'done';
    return index === currentIndex ? 'current' : 'future';
  };

  const items = [
    ...plan.nodes.map((node) => ({
      index: node.index,
      icon: NODE_KIND_ICONS[node.kind],
      name: NODE_KIND_NAMES[node.kind],
    })),
    { index: plan.nodes.length, icon: 'flag' as IconName, name: 'финиш урока' },
  ];
  const isFinish = (index: number) => index === plan.nodes.length;

  return (
    <View style={styles.row}>
      {items.map((item, i) => {
        const state = stateOf(item.index);
        const next = items[i + 1];
        const nextState = next ? stateOf(next.index) : null;
        const size = scale(state === 'current' ? 44 : 34);
        return (
          <View key={item.index} style={styles.cell}>
            <TouchableOpacity
              onPress={() => onPressNode(item.index)}
              disabled={state === 'future' || isFinish(item.index)}
              activeOpacity={0.8}
              style={styles.touch}
              accessibilityRole={isFinish(item.index) ? 'image' : 'button'}
              accessibilityState={{ disabled: state === 'future' || isFinish(item.index) }}
              accessibilityLabel={`Этап ${i + 1}, ${item.name}: ${
                state === 'done' ? 'пройден' : state === 'current' ? 'сейчас' : 'впереди'
              }`}
            >
              <View
                style={[
                  styles.circle,
                  state === 'done' && styles.circleDone,
                  state === 'current' && styles.circleCurrent,
                  { width: size, height: size, borderRadius: size / 2 },
                ]}
              >
                <Ionicons
                  name={state === 'done' ? 'checkmark' : item.icon}
                  size={scale(state === 'current' ? 20 : 16)}
                  color={state === 'future' ? theme.textMuted : theme.onGradient}
                />
              </View>
            </TouchableOpacity>
            {next && (
              <View
                style={[
                  styles.connector,
                  state === 'done' && nextState === 'done' && styles.connectorDone,
                  state === 'done' && nextState === 'current' && styles.connectorCurrent,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
