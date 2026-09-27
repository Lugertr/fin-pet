// src/components/savings/SavingsAmountModal/SavingsAmountModal.tsx
// Окно суммы в «Копилке»: «Дополнить из хотений» (кошелёк «Хочу» → банк
// «Коплю», §11.4) и «Снять» (банк → кошелёк). Только целые монеты; больше,
// чем есть, выбрать нельзя — кнопка неактивна, и причина написана текстом
// (§12.3, §23). Само перемещение денег делает вызывающий (savingsStore);
// ошибку он возвращает строкой — она показывается здесь же.
// Монтируется только открытым — сумма и ошибка сбрасываются сами.

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createSavingsAmountModalStyles } from './SavingsAmountModal.styles';

export type SavingsAmountMode = 'deposit' | 'withdraw';

const PRESETS = [10, 50, 100];

const COPY: Record<
  SavingsAmountMode,
  {
    title: string;
    /** Откуда берутся монеты — «В «Хочу»» в начале строки и «в «Хочу»» в середине. */
    source: string;
    sourceInline: string;
    confirm: string;
    note: (bonusRate: number) => string;
  }
> = {
  deposit: {
    title: 'Дополнить из хотений',
    source: 'В «Хочу»',
    sourceInline: 'в «Хочу»',
    confirm: 'Отложить',
    note: (bonusRate) =>
      `Монеты перейдут в «Коплю» и будут копиться на цель. За новые монеты копилка добавит +${bonusRate}%.`,
  },
  withdraw: {
    title: 'Снять в кошелёк',
    source: 'В «Коплю»',
    sourceInline: 'в «Коплю»',
    confirm: 'Снять',
    note: () =>
      'Монеты вернутся в «Хочу», и цель станет дальше. Если потом положишь их обратно, бонуса за них не будет.',
  },
};

export function SavingsAmountModal({
  mode,
  available,
  bonusRate,
  onSubmit,
  onClose,
}: {
  mode: SavingsAmountMode;
  /** Сколько можно перевести: кошелёк при пополнении, банк при снятии. */
  available: number;
  /** Бонус копилки в % (для подсказки при пополнении). */
  bonusRate: number;
  /** Переводит сумму; null — успех, строка — почему не получилось. */
  onSubmit: (amount: number) => Promise<string | null>;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createSavingsAmountModalStyles({ theme });
  const copy = COPY[mode];

  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const value = parseInt(amount, 10) || 0;
  const tooMuch = value > available;
  const canSubmit = value > 0 && !tooMuch && !busy;

  let hint: string | null = null;
  if (available <= 0) hint = `${copy.source} пока пусто`;
  else if (tooMuch) hint = `Столько нет: ${copy.sourceInline} только ${formatPrice(available)}`;
  else if (error) hint = error;

  const presets = PRESETS.filter((preset) => preset < available);

  const pickAmount = (next: number) => {
    triggerHaptic('selection');
    setError(null);
    setAmount(String(next));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    const failure = await onSubmit(value);
    setBusy(false);
    if (failure) setError(failure);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Закрыть"
        />
        <View style={styles.content}>
          <Text style={[styles.title, { fontSize: scaledFont('xxl') }]}>{copy.title}</Text>
          <Text style={[styles.available, { fontSize: scaledFont('lg') }]}>
            {copy.source}: {formatPrice(available)}
          </Text>

          <TextInput
            value={amount}
            onChangeText={(text) => {
              setError(null);
              // Только целые монеты (деньги — целые числа).
              setAmount(text.replace(/\D/g, '').slice(0, 7));
            }}
            placeholder="Сколько монет?"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            style={[styles.input, { fontSize: scaledFont('xl') }]}
            accessibilityLabel="Сумма в монетах"
          />

          {available > 0 && (
            <View style={styles.presetsRow}>
              {presets.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => pickAmount(preset)}
                  style={styles.preset}
                  accessibilityRole="button"
                  accessibilityLabel={`${preset} монет`}
                >
                  <Text style={[styles.presetText, { fontSize: scaledFont('lg') }]}>{preset}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => pickAmount(available)}
                style={styles.preset}
                accessibilityRole="button"
                accessibilityLabel="Все монеты"
              >
                <Text style={[styles.presetText, { fontSize: scaledFont('lg') }]}>Все</Text>
              </TouchableOpacity>
            </View>
          )}

          {hint ? (
            <Text
              style={[styles.hint, { fontSize: scaledFont('md') }]}
              accessibilityLiveRegion="polite"
            >
              {hint}
            </Text>
          ) : null}

          <Text style={[styles.note, { fontSize: scaledFont('md') }]}>{copy.note(bonusRate)}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelButton}
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { fontSize: scaledFont('lg') }]}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.confirmButton, !canSubmit && styles.confirmButtonDisabled]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
            >
              <Text style={[styles.confirmButtonText, { fontSize: scaledFont('lg') }]}>
                {copy.confirm}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
