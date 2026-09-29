// src/components/lesson/RewardStep/RewardStep.tsx
// Шаг «Награда». Награда уже начислена (useLessonsStore.finishLesson), экран
// только показывает её. Монет за урок нет (решение пользователя 29.09.2026) —
// урок оплачивается зарплатой смены; здесь:
// - первое прохождение — опыт;
// - впервые без ошибок — звезда;
// - звезды нет — как её получить (перепройти тест или игру без ошибок);
// - опыт дал новый уровень — карточка уровня (§8.4);
// - урок смены: пройден — смена закрыта, «К итогам смены» ведёт прямо на
//   хаб (отдельного экрана «Урок пройден» больше нет, решение 29.09.2026).

import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { LevelUpCard } from '@/components/shared';
import { ScreenFooter } from '@/components/ui';
import type { LessonRewardResult } from '@/lib/hooks/useLessons';
import { useResponsive, useTheme } from '@/theme';
import { emojiSizes, spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';

export function RewardStep({
  reward,
  isAdventureQuest,
  isReplay,
  hasStar,
  firstPerfect,
  onCollect,
}: {
  reward: LessonRewardResult;
  isAdventureQuest: boolean;
  /** §9: пройденный урок доступен для повтора без награды. */
  isReplay: boolean;
  /** У урока есть звезда (пройден без ошибок — сейчас или раньше). */
  hasStar: boolean;
  /** Звезда получена только что. */
  firstPerfect: boolean;
  onCollect: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLessonStepsStyles({ theme });

  return (
    <View style={styles.stepContainer}>
      <View style={styles.rewardScrollArea}>
        <ScrollView contentContainerStyle={styles.rewardScrollContent}>
          <Text style={{ fontSize: scale(emojiSizes.xxl) }}>
            {isReplay ? '🔁' : isAdventureQuest ? '🏁' : '🎉'}
          </Text>

          {isReplay ? (
            <>
              <Text style={[styles.rewardTitle, { fontSize: scaledFont('title') }]}>
                Урок повторён!
              </Text>
              <Text style={[styles.rewardReasonText, { fontSize: scaledFont('md') }]}>
                Повторение помогает лучше запомнить.
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.rewardTitle, { fontSize: scaledFont('title') }]}>
                {isAdventureQuest ? 'Урок смены пройден!' : 'Урок пройден!'}
              </Text>
              {isAdventureQuest && (
                <Text style={[styles.rewardReasonText, { fontSize: scaledFont('md') }]}>
                  Смена на сегодня сделана — итоги ждут на хабе.
                </Text>
              )}
              {reward.xp > 0 && (
                <Text style={[styles.rewardXpText, { fontSize: scaledFont('lg') }]}>
                  +{reward.xp} опыта
                </Text>
              )}
            </>
          )}

          {firstPerfect ? (
            <View style={styles.rewardPerfectCard}>
              <Text style={[styles.rewardPerfectTitle, { fontSize: scaledFont('md') }]}>
                ★ Идеально! Ни одной ошибки — у урока звезда
              </Text>
            </View>
          ) : (
            !hasStar && (
              <View style={styles.rewardHintCard}>
                <Text style={[styles.rewardHintText, { fontSize: scaledFont('md') }]}>
                  ☆ Перепройди тесты и игры урока без ошибок — появится звезда.
                </Text>
              </View>
            )
          )}

          {reward.levelUp && (
            <View style={styles.rewardLevelUp}>
              <LevelUpCard levelUp={reward.levelUp} />
            </View>
          )}
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity onPress={onCollect} activeOpacity={0.8} style={styles.gradientButton}>
          <LinearGradient
            colors={theme.gradients.reward}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
          >
            <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
              {isReplay ? 'Дальше' : isAdventureQuest ? 'К итогам смены' : 'Забрать'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
