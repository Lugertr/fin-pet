// src/app/(modal)/deposit.tsx
// Экран вкладов: создание, просмотр, снятие

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import {
    useCreateDeposit,
    useDeposits,
    useWithdrawEarly,
    useWithdrawSuccess,
} from '@/lib/hooks/useDeposits';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins, formatDaysCount } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { Deposit } from '@/types/models';
import { createDepositStyles } from '../../styles/screens/modal/_deposit.styles';

export default function DepositScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { trigger, triggerHaptic } = useFeedback();
  const { user } = useUserStore();
  const { data: depositsData, isLoading } = useDeposits();
  const createDepositMutation = useCreateDeposit();

  const styles = createDepositStyles({ theme });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const balance = user?.liquid_balance || 0;

  const headerGradient: [string, string] = ['#059669', '#10B981'];

  const handleCreateDeposit = async () => {
    const amount = parseInt(depositAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      trigger('error');
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    if (amount > balance) {
      trigger('error');
      Alert.alert('Ошибка', 'Недостаточно средств');
      return;
    }

    try {
      await createDepositMutation.mutateAsync({ principal: amount });
      trigger('purchase');
      setShowCreateForm(false);
      setDepositAmount('');
      Alert.alert('🎉 Успех', 'Вклад создан! Проценты начисляются ежедневно.');
    } catch (error) {
      trigger('error');
      Alert.alert('Ошибка', 'Не удалось создать вклад');
    }
  };

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.xl) }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { width: scale(36), height: scale(36) }]}
          >
            <Ionicons name="arrow-back" size={scale(20)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>Вклады</Text>
          <View style={{ width: scale(36) }} />
        </View>

        {/* Баланс */}
        <View style={[styles.balanceCard, { padding: scale(spacing.xl) }]}>
          <Text style={[styles.balanceLabel, { fontSize: scaledFont('sm') }]}>
            Доступно для вклада
          </Text>
          <Text style={[styles.balanceValue, { fontSize: scaledFont('hero') }]}>
            {formatCoins(balance)}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.depositsScroll} showsVerticalScrollIndicator={false}>
        {/* Форма создания вклада */}
        {showCreateForm ? (
          <View
            style={[styles.createForm, { margin: scale(spacing.lg), padding: scale(spacing.xl) }]}
          >
            <Text
              style={[
                styles.formTitle,
                { fontSize: scaledFont('xl'), marginBottom: scale(spacing.lg) },
              ]}
            >
              Новый вклад
            </Text>

            <View style={{ marginBottom: scale(spacing.lg) }}>
              <Text
                style={[
                  styles.inputLabel,
                  { fontSize: scaledFont('md'), marginBottom: scale(spacing.sm) },
                ]}
              >
                Сумма вклада
              </Text>
              <TextInput
                value={depositAmount}
                onChangeText={setDepositAmount}
                placeholder="Введите сумму"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                style={[styles.inputField, { fontSize: scaledFont('lg') }]}
              />
            </View>

            {/* Быстрые суммы */}
            <View
              style={[
                styles.quickAmountsRow,
                { gap: scale(spacing.sm), marginBottom: scale(spacing.lg) },
              ]}
            >
              {[100, 500, 1000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => {
                    triggerHaptic('selection');
                    setDepositAmount(amount.toString());
                  }}
                  style={[styles.quickAmountButton, { paddingVertical: scale(spacing.sm) }]}
                >
                  <Text style={[styles.quickAmountText, { fontSize: scaledFont('md') }]}>
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Информация о ставке */}
            <View
              style={[
                styles.rateInfoBanner,
                { padding: scale(spacing.lg), marginBottom: scale(spacing.lg) },
              ]}
            >
              <Text style={[styles.rateInfoText, { fontSize: scaledFont('sm') }]}>
                💰 Ставка: 2% в день{'\n'}Досрочное снятие — проценты сгорают
              </Text>
            </View>

            <View style={styles.formButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowCreateForm(false)}
                activeOpacity={0.8}
                style={[styles.formButtonSecondary, { padding: scale(spacing.lg) }]}
              >
                <Text style={[styles.formButtonTextSecondary, { fontSize: scaledFont('md') }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateDeposit}
                disabled={createDepositMutation.isPending}
                activeOpacity={0.8}
                style={[styles.formButtonPrimary, { padding: scale(spacing.lg) }]}
              >
                <Text style={[styles.formButtonText, { fontSize: scaledFont('md') }]}>
                  {createDepositMutation.isPending ? 'Создаём...' : 'Создать'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              setShowCreateForm(true);
            }}
            activeOpacity={0.8}
            style={[styles.createButton, { margin: scale(spacing.lg) }]}
          >
            <LinearGradient
              colors={['#10B981', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.createButtonInner, { padding: scale(spacing.lg) }]}
            >
              <Ionicons name="add-circle" size={scale(24)} color="#FFFFFF" />
              <Text style={[styles.createButtonText, { fontSize: scaledFont('lg') }]}>
                Создать вклад
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Список вкладов */}
        <View style={[styles.depositsScrollContent, { paddingHorizontal: scale(spacing.lg) }]}>
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: scaledFont('xl'), marginBottom: scale(spacing.lg) },
            ]}
          >
            Активные вклады
          </Text>

          {isLoading ? (
            <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>Загрузка...</Text>
          ) : depositsData?.deposits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: scale(56), marginBottom: scale(spacing.md) }}>🏦</Text>
              <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
                У вас пока нет вкладов.{'\n'}Создайте первый, чтобы копить!
              </Text>
            </View>
          ) : (
            <View style={styles.depositsList}>
              {depositsData?.deposits.map((deposit) => (
                <DepositCard key={deposit.id} deposit={deposit} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Карточка вклада
 */
function DepositCard({ deposit }: { deposit: Deposit }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { trigger } = useFeedback();

  const styles = createDepositStyles({ theme });

  const withdrawEarlyMutation = useWithdrawEarly();
  const withdrawSuccessMutation = useWithdrawSuccess();

  const daysPassed = Math.floor(
    (Date.now() - new Date(deposit.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  const accruedInterest = Math.floor(
    (daysPassed * deposit.daily_rate_percent * deposit.principal) / 100
  );
  const total = deposit.principal + accruedInterest;

  const handleWithdrawEarly = () => {
    trigger('error');
    Alert.alert(
      'Досрочное снятие',
      `Вы потеряете ${formatCoins(accruedInterest)} процентов. Забрать только ${formatCoins(deposit.principal)}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Забрать',
          style: 'destructive',
          onPress: () => withdrawEarlyMutation.mutate(deposit.id),
        },
      ]
    );
  };

  const handleWithdrawSuccess = () => {
    trigger('purchase');
    Alert.alert(
      'Завершение вклада',
      `Забрать ${formatCoins(total)} (${formatCoins(deposit.principal)} + ${formatCoins(accruedInterest)} процентов)?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Забрать',
          onPress: () => withdrawSuccessMutation.mutate(deposit.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.depositCard, { padding: scale(spacing.xl) }]}>
      <View style={styles.depositHeaderRow}>
        <View style={styles.depositLeftRow}>
          <View
            style={[
              styles.depositIconBox,
              {
                width: scale(48),
                height: scale(48),
                borderRadius: scale(spacing.lg),
              },
            ]}
          >
            <Text style={{ fontSize: scale(24) }}>🏦</Text>
          </View>
          <View>
            <Text style={[styles.depositPrincipal, { fontSize: scaledFont('lg') }]}>
              {formatCoins(deposit.principal)}
            </Text>
            <Text style={[styles.depositMeta, { fontSize: scaledFont('sm') }]}>
              {formatDaysCount(daysPassed)} • {deposit.daily_rate_percent}% в день
            </Text>
          </View>
        </View>
        <View style={styles.depositTotalContainer}>
          <Text style={[styles.depositTotal, { fontSize: scaledFont('xl') }]}>
            {formatCoins(total)}
          </Text>
          <Text style={[styles.depositInterest, { fontSize: scaledFont('sm') }]}>
            +{formatCoins(accruedInterest)}
          </Text>
        </View>
      </View>

      {/* Прогресс */}
      <View style={[styles.depositProgressBar, { marginBottom: scale(spacing.lg) }]}>
        <LinearGradient
          colors={['#10B981', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: '100%',
            width: `${Math.min((daysPassed / 7) * 100, 100)}%`,
          }}
        />
      </View>

      <View style={styles.depositButtonsRow}>
        <TouchableOpacity
          onPress={handleWithdrawEarly}
          activeOpacity={0.8}
          style={[styles.depositButtonSecondary, { paddingVertical: scale(spacing.sm) }]}
        >
          <Text style={[styles.depositButtonTextSecondary, { fontSize: scaledFont('sm') }]}>
            Досрочно
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleWithdrawSuccess}
          activeOpacity={0.8}
          style={[styles.depositButtonPrimary, { paddingVertical: scale(spacing.sm) }]}
        >
          <Text style={[styles.depositButtonText, { fontSize: scaledFont('sm') }]}>
            Забрать всё
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
