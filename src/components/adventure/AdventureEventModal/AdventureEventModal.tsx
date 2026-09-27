// src/components/adventure/AdventureEventModal/AdventureEventModal.tsx
// Модалка случайного события приключения — 2-3 варианта на выбор. Можно
// закрыть, не выбирая (тап на фон/аппаратная кнопка назад) — событие
// останется нерешённым и не помешает выполнять задания дальше, только
// заблокирует завершение приключения (см. adventureStore.completeAdventure).
// Платит бюджет приключения (не кошелёк хаба). Платный вариант, на который
// не хватает бюджета, неактивен и подписан текстом
// (§12.3 — без частичной оплаты; §23 — смысл передаёт не только цвет).

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { CoinAmount } from '@/components/shared';
import { AdventureEventTemplate, isOptionAffordable } from '@/domain/adventure/AdventureEvent';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { useResponsive, useTheme } from '@/theme';
import { emojiSizes, spacing } from '@/theme/tokens';
import { createAdventureEventModalStyles } from './AdventureEventModal.styles';

export function AdventureEventModal({
  template,
  onChoose,
  onDismiss,
}: {
  template: AdventureEventTemplate;
  onChoose: (optionId: string) => void;
  onDismiss: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createAdventureEventModalStyles({ theme });
  // resolveEvent() в сторе асинхронный (списание денег ждёт запись в БД) —
  // без этой защиты повторный тап по варианту до завершения первого вызова
  // применил бы эффект дважды (двойное списание/двойной сдвиг таймера).
  const [submittedOptionId, setSubmittedOptionId] = useState<string | null>(null);

  // Деньги событий — бюджет приключения (отдельный от кошелька хаба контур).
  const balance = useAdventureStore((s) => s.currentAdventure?.budget ?? 0);

  const handleChoose = (optionId: string) => {
    if (submittedOptionId) return;
    const option = template.options.find((o) => o.id === optionId);
    if (!option || !isOptionAffordable(option, balance)) return;
    setSubmittedOptionId(optionId);
    triggerHaptic('medium');
    onChoose(optionId);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onDismiss}
        />

        <View style={[styles.modalContent, { padding: scale(spacing.xxl) }]}>
          <Text style={[styles.icon, { fontSize: scale(emojiSizes.lg) }]}>{template.icon}</Text>
          <Text style={[styles.title, { fontSize: scaledFont('xl') }]}>{template.title}</Text>
          <Text style={[styles.description, { fontSize: scaledFont('md') }]}>
            {template.description}
          </Text>
          <CoinAmount
            amount={balance}
            prefix="Бюджет приключения: "
            fontSize={scaledFont('sm')}
            style={styles.budgetRow}
            textStyle={styles.budgetText}
          />

          <View style={{ gap: scale(spacing.sm) }}>
            {template.options.map((option) => {
              const affordable = isOptionAffordable(option, balance);
              // Эффекты варианта (деньги/время) не зашиты в подпись контента, а
              // рисуются из данных — цифры всегда совпадают с тем, что реально произойдёт.
              const coinAmount = option.coinAmount;
              const minutes = option.timeDeltaMinutes;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleChoose(option.id)}
                  disabled={submittedOptionId !== null || !affordable}
                  accessibilityState={{ disabled: submittedOptionId !== null || !affordable }}
                  activeOpacity={0.8}
                  style={[
                    styles.optionButton,
                    { padding: scale(spacing.md) },
                    ((submittedOptionId !== null && submittedOptionId !== option.id) ||
                      !affordable) &&
                      styles.optionButtonDisabled,
                  ]}
                >
                  <Text style={[styles.optionLabel, { fontSize: scaledFont('lg') }]}>
                    {option.label}
                  </Text>
                  {(coinAmount !== 0 || minutes !== 0) && (
                    <View style={styles.effectsRow}>
                      {coinAmount !== 0 && (
                        <CoinAmount
                          amount={Math.abs(coinAmount)}
                          prefix={coinAmount < 0 ? '−' : '+'}
                          fontSize={scaledFont('sm')}
                          textStyle={styles.effectText}
                        />
                      )}
                      {minutes !== 0 && (
                        <View style={styles.effectTime}>
                          <Ionicons
                            name="time-outline"
                            size={scale(14)}
                            color={theme.textSecondary}
                          />
                          <Text style={[styles.effectText, { fontSize: scaledFont('sm') }]}>
                            {minutes < 0 ? '−' : '+'}
                            {Math.abs(minutes)} мин
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  {!affordable && (
                    <CoinAmount
                      amount={-coinAmount - balance}
                      prefix="Не хватает "
                      fontSize={scaledFont('sm')}
                      style={styles.effectsRow}
                      textStyle={styles.optionHint}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
