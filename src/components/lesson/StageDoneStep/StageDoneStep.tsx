// src/components/lesson/StageDoneStep/StageDoneStep.tsx
// «Этап пройден» — урок смены проходится по этапам (решение пользователя
// 28.09.2026): одно «Начать задание» на экране работы — один этап трека.
// После этапа — этот экран и возврат к работе; следующий этап (или
// завершение урока) начинается там же. Вне смены урок идёт целиком.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { ScreenFooter } from '@/components/ui';
import { useResponsive, useTheme } from '@/theme';
import { circleRadius, emojiSizes, spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';

export function StageDoneStep({
  nodesDone,
  nodesTotal,
  nextLabel,
  onBackToWork,
}: {
  /** Пройдено этапов трека («Этап 2 из 4»). */
  nodesDone: number;
  nodesTotal: number;
  /** Что дальше: «тест», «мини-игра», «событие» или «завершение урока». */
  nextLabel: string;
  onBackToWork: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLessonStepsStyles({ theme });

  return (
    <View style={styles.stepContainer}>
      <View style={styles.completeScrollArea}>
        <ScrollView contentContainerStyle={styles.completeScrollContent}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.completeTrophyBox,
              {
                width: scale(120),
                height: scale(120),
                borderRadius: circleRadius(scale(120)),
                marginBottom: scale(spacing.xxl),
              },
            ]}
          >
            <Text style={{ fontSize: scale(emojiSizes.xxl) }}>✅</Text>
          </LinearGradient>

          <Text style={[styles.completeTitle, { fontSize: scaledFont('hero') }]}>
            Этап {nodesDone} из {nodesTotal} пройден!
          </Text>
          <Text style={[styles.completeSubtitle, { fontSize: scaledFont('lg') }]}>
            Смена продвигается. Дальше — {nextLabel}: начнёшь на экране смены кнопкой «Начать
            задание».
          </Text>
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity
          onPress={onBackToWork}
          activeOpacity={0.8}
          style={styles.gradientButton}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
          >
            <Ionicons name="briefcase" size={scale(24)} color={theme.onGradient} />
            <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>К смене</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
