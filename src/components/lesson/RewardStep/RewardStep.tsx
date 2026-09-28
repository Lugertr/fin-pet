// src/components/lesson/RewardStep/RewardStep.tsx
// Шаг «Награда». Монеты за первое прохождение урока идут сразу на счёт хаба
// (кошелёк) — и за обычный урок, и за урок смены (у смены свой бюджет, уроки
// его не пополняют).
// - урок смены — монеты; урок пройден — смена закрыта, итоги ждут на хабе;
//   без ошибок — ещё похвала.
// - обычный урок — монеты.
// - повтор пройденного — без награды (§9).
// Монеты начисляются один раз при показе (не при каждом ререндере).

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { CoinAmount } from '@/components/shared';
import { ScreenFooter } from '@/components/ui';
import { RewardStep as RewardStepData } from '@/domain/lesson/LessonStep';
import { useUserStore } from '@/lib/stores/userStore';
import { useResponsive, useTheme } from '@/theme';
import { emojiSizes, spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';

export function RewardStep({
  step,
  isAdventureQuest,
  isReplay,
  isPerfect,
  onCollect,
}: {
  step: RewardStepData;
  isAdventureQuest: boolean;
  /** §9: пройденный урок доступен для повтора без награды. */
  isReplay: boolean;
  isPerfect: boolean;
  onCollect: (awardedCoins: number) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLessonStepsStyles({ theme });
  const hasCreditedRef = useRef(false);

  // Повтор уже пройденного урока — без награды (§9); иначе монеты на счёт хаба.
  const awardsCoins = !isReplay;

  useEffect(() => {
    if (hasCreditedRef.current) return;
    hasCreditedRef.current = true;
    if (awardsCoins) {
      useUserStore.getState().recordTransaction(step.coins, 'lesson_reward', step.reason);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.stepContainer}>
      <View style={styles.rewardScrollArea}>
        <ScrollView contentContainerStyle={styles.rewardScrollContent}>
          <Text style={{ fontSize: scale(emojiSizes.xxl) }}>
            {isReplay ? '🔁' : isAdventureQuest ? '🏁' : '🎉'}
          </Text>

          {isReplay ? (
            <>
              <Text style={[styles.rewardTimeText, { fontSize: scaledFont('title') }]}>
                Урок повторён!
              </Text>
              <Text style={[styles.rewardReasonText, { fontSize: scaledFont('md') }]}>
                Награда за этот урок уже получена — а повторение помогает лучше запомнить.
              </Text>
            </>
          ) : isAdventureQuest ? (
            <>
              <Text style={[styles.rewardTimeText, { fontSize: scaledFont('title') }]}>
                Урок смены пройден!
              </Text>
              <CoinAmount
                amount={step.coins}
                prefix="+"
                fontSize={scaledFont('xxl')}
                style={styles.rewardPerfectCoinsRow}
                textStyle={styles.rewardPerfectCoins}
              />
              <Text style={[styles.rewardReasonText, { fontSize: scaledFont('md') }]}>
                на твой счёт
              </Text>
              {isPerfect && (
                <View style={styles.rewardPerfectCard}>
                  <Text style={[styles.rewardPerfectTitle, { fontSize: scaledFont('md') }]}>
                    Идеально! Ни одной ошибки
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <CoinAmount
                amount={step.coins}
                prefix="+"
                fontSize={scaledFont('hero')}
                style={styles.rewardCoinsRow}
                textStyle={styles.rewardCoinsText}
              />
              <Text style={[styles.rewardReasonText, { fontSize: scaledFont('md') }]}>
                {step.reason}
              </Text>
            </>
          )}
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity
          onPress={() => onCollect(awardsCoins ? step.coins : 0)}
          activeOpacity={0.8}
          style={styles.gradientButton}
        >
          <LinearGradient
            colors={theme.gradients.reward}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
          >
            <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
              {isReplay ? 'Дальше' : 'Забрать'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
