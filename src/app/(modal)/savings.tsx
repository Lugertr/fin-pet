// src/app/(modal)/savings.tsx
// Накопления и финансовая цель (§11 ТЗ) — заменяет старый нерабочий экран «Вклады»

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GoalPickerModal } from '@/components/savings';
import { Card, IconButton, SectionTitle } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { SHOP_CATALOG, ShopItem } from '@/lib/hooks/useShop';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatCoins } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { colorPalettes, spacing } from '@/theme/tokens';
import { createSavingsStyles } from '@/styles/screens/modal/_savings.styles';

export default function SavingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();
  const user = useUserStore((s) => s.user);
  const savings = useSavingsStore((s) => s.savings);
  const setTarget = useSavingsStore((s) => s.setTarget);
  const deposit = useSavingsStore((s) => s.deposit);
  const withdraw = useSavingsStore((s) => s.withdraw);

  const styles = createSavingsStyles({ theme });

  const [amount, setAmount] = useState('');
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const walletBalance = user?.liquid_balance ?? 0;
  const targetItem = savings?.targetItemId
    ? (SHOP_CATALOG.find((i) => i.id === savings.targetItemId) ?? null)
    : null;
  const progress = targetItem
    ? Math.min(100, Math.round(((savings?.currentAmount ?? 0) / targetItem.price) * 100))
    : 0;

  const handleDeposit = async () => {
    const value = parseInt(amount, 10);
    if (!value || value <= 0) {
      trigger('error');
      Alert.alert('Ошибка', 'Введите сумму больше нуля');
      return;
    }
    const result = await deposit(value);
    if (result.success) {
      trigger('purchase');
      triggerHaptic('success');
      setAmount('');
      Alert.alert('Готово', result.message);
    } else {
      trigger('error');
      Alert.alert('Не получилось', result.message);
    }
  };

  const handleWithdraw = async () => {
    const value = parseInt(amount, 10);
    if (!value || value <= 0) {
      trigger('error');
      Alert.alert('Ошибка', 'Введите сумму больше нуля');
      return;
    }
    const result = await withdraw(value);
    if (result.success) {
      trigger('purchase');
      setAmount('');
      Alert.alert('Готово', result.message);
    } else {
      trigger('error');
      Alert.alert('Не получилось', result.message);
    }
  };

  const handlePickGoal = (item: ShopItem) => {
    triggerHaptic('selection');
    setTarget(item.id);
    setShowGoalPicker(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colorPalettes.emerald[600], colorPalettes.emerald[500]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <IconButton icon="arrow-back" onPress={() => router.back()} variant="onGradient" />
          <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>Накопления</Text>
          <View style={{ width: scale(36) }} />
        </View>

        <View style={styles.balanceCard}>
          <Text style={[styles.balanceLabel, { fontSize: scaledFont('sm') }]}>Отложено</Text>
          <Text style={[styles.balanceValue, { fontSize: scaledFont('hero') }]}>
            {formatCoins(savings?.currentAmount ?? 0)}
          </Text>
          <Text style={[styles.balanceHint, { fontSize: scaledFont('xs') }]}>
            Бонус +{savings?.bonusRate ?? 0}% при пополнении · в кошельке{' '}
            {formatCoins(walletBalance)}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {
          <>
            {/* Цель накопления (§11.2-11.3) */}
            <SectionTitle size="lg" marginBottom={spacing.md}>
              Финансовая цель
            </SectionTitle>
            <Card padding="md" style={styles.cardSpacing}>
              {targetItem ? (
                <>
                  <View style={styles.targetHeaderRow}>
                    <View style={styles.targetIconBox}>
                      <Text style={{ fontSize: scaledFont('xxxl') }}>{targetItem.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.targetName, { fontSize: scaledFont('lg') }]}>
                        {targetItem.name}
                      </Text>
                      <Text style={[styles.targetPrice, { fontSize: scaledFont('sm') }]}>
                        {formatCoins(savings?.currentAmount ?? 0)} из{' '}
                        {formatCoins(targetItem.price)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.targetProgressBar}>
                    <LinearGradient
                      colors={theme.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: '100%', width: `${progress}%` }}
                    />
                  </View>
                  <Text style={[styles.targetProgressText, { fontSize: scaledFont('sm') }]}>
                    {progress}% — при достижении цели предмет придёт в инвентарь автоматически
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowGoalPicker(true)}
                    style={styles.secondaryButton}
                  >
                    <Text style={[styles.secondaryButtonText, { fontSize: scaledFont('sm') }]}>
                      Сменить цель
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.emptyTargetText, { fontSize: scaledFont('md') }]}>
                    Выберите, на что копить — предмет из магазина
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowGoalPicker(true)}
                    style={styles.primaryButton}
                  >
                    <Text style={[styles.primaryButtonText, { fontSize: scaledFont('md') }]}>
                      Выбрать цель
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Card>

            {/* Пополнение / снятие (§11.1, §11.4) */}
            <SectionTitle size="lg" marginBottom={spacing.md}>
              Пополнить или снять
            </SectionTitle>
            <Card padding="md" style={styles.cardSpacing}>
              <View style={styles.inputRow}>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Сумма"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  style={[styles.inputField, { fontSize: scaledFont('lg') }]}
                />
              </View>
              <View style={styles.quickAmountsRow}>
                {[10, 50, 100].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => {
                      triggerHaptic('selection');
                      setAmount(String(preset));
                    }}
                    style={styles.quickAmountButton}
                  >
                    <Text style={[styles.quickAmountText, { fontSize: scaledFont('md') }]}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={handleDeposit} style={styles.depositButton}>
                  <Text style={[styles.actionButtonText, { fontSize: scaledFont('md') }]}>
                    Отложить
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleWithdraw} style={styles.withdrawButton}>
                  <Text style={[styles.withdrawButtonText, { fontSize: scaledFont('md') }]}>
                    Снять
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <View style={styles.infoBanner}>
              <Text style={[styles.infoBannerText, { fontSize: scaledFont('xs') }]}>
                Это не банковский вклад: бонус небольшой и фиксированный, начисляется сразу при
                пополнении. 3 периода без снятия и достижение цели приносят подарок.
              </Text>
            </View>
          </>
        }
      </ScrollView>

      <GoalPickerModal
        visible={showGoalPicker}
        onClose={() => setShowGoalPicker(false)}
        onPick={handlePickGoal}
      />
    </View>
  );
}
