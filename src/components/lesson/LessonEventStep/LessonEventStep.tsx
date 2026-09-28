// src/components/lesson/LessonEventStep/LessonEventStep.tsx
// Событие внутри урока (решение пользователя 28.09.2026): выбор по ситуации
// урока, не по времени. Платит бюджет смены — если это урок смены; иначе
// выбор без денег (урок вне смены).
// Платный вариант, на который не хватает бюджета, неактивен и подписан
// текстом (§12.3 — без частичной оплаты; §23 — смысл не только цветом).

import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { CoinAmount } from '@/components/shared';
import { canAfford } from '@/domain/adventure/Adventure';
import { LessonEventContent } from '@/domain/content/LessonContent';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { emojiSizes, spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';
import { createLessonEventStepStyles } from './LessonEventStep.styles';

export function LessonEventStep({
  event,
  budget,
  onChoose,
}: {
  event: LessonEventContent;
  /** Бюджет приключения; null — урок вне приключения, деньги не двигаются. */
  budget: number | null;
  onChoose: (optionId: string) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const stepStyles = createLessonStepsStyles({ theme });
  const styles = createLessonEventStepStyles({ theme });
  // Выбор применяется асинхронно (запись бюджета) — повторный тап до его
  // окончания списал бы деньги дважды.
  const [submittedOptionId, setSubmittedOptionId] = useState<string | null>(null);

  const affordable = (coinAmount: number) => budget === null || canAfford(coinAmount, budget);

  const handleChoose = (optionId: string) => {
    if (submittedOptionId) return;
    const option = event.options.find((o) => o.id === optionId);
    if (!option || !affordable(option.coinAmount)) return;
    setSubmittedOptionId(optionId);
    triggerHaptic('medium');
    onChoose(optionId);
  };

  return (
    <View style={stepStyles.stepContainer}>
      <ScrollView
        contentContainerStyle={{ padding: scale(spacing.xl), gap: scale(spacing.sm) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.icon, { fontSize: scale(emojiSizes.xl) }]}>{event.icon}</Text>
        <Text style={[styles.title, { fontSize: scaledFont('xl') }]} accessibilityRole="header">
          {event.title}
        </Text>
        <Text style={[styles.description, { fontSize: scaledFont('md') }]}>
          {event.description}
        </Text>
        {budget === null ? (
          <Text style={[styles.description, { fontSize: scaledFont('sm') }]}>
            Урок идёт не в смене — бюджет не изменится.
          </Text>
        ) : (
          <CoinAmount
            amount={budget}
            prefix="Бюджет работы: "
            fontSize={scaledFont('md')}
            style={styles.budgetRow}
            textStyle={styles.budgetText}
          />
        )}

        {event.options.map((option) => {
          const canPay = affordable(option.coinAmount);
          const disabled = submittedOptionId !== null || !canPay;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleChoose(option.id)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ disabled }}
              activeOpacity={0.8}
              style={[
                styles.optionButton,
                { padding: scale(spacing.md) },
                ((submittedOptionId !== null && submittedOptionId !== option.id) || !canPay) &&
                  styles.optionButtonDisabled,
              ]}
            >
              <Text style={[styles.optionLabel, { fontSize: scaledFont('lg') }]}>
                {option.label}
              </Text>
              {/* Сумма — из данных, не из подписи: цифра совпадает с тем, что спишется. */}
              {option.coinAmount !== 0 && (
                <CoinAmount
                  amount={Math.abs(option.coinAmount)}
                  prefix={option.coinAmount < 0 ? '−' : '+'}
                  fontSize={scaledFont('sm')}
                  style={styles.effectsRow}
                  textStyle={styles.effectText}
                />
              )}
              {!canPay && budget !== null && (
                <CoinAmount
                  amount={-option.coinAmount - budget}
                  prefix="Не хватает "
                  fontSize={scaledFont('sm')}
                  style={styles.effectsRow}
                  textStyle={styles.optionHint}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
