// src/components/savings/SavingsHeader/SavingsHeader.tsx
// Шапка вкладки «Копилка» по макету (27.09.2026): «назад» на хаб, заголовок,
// «?», плашка «всего монет» (кошелёк «Хочу» + банк «Коплю») с копилкой и
// декоративной полоской, как у кошелька в общей шапке, и кнопка профиля.

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { HelpButton } from '@/components/shared';
import { IconButton } from '@/components/ui';
import { FURNITURE_ASSETS } from '@/constants/itemAssets';
import type { ScreenHelpId } from '@/domain/content/ReferenceContent';
import { PLAN_CATEGORY_COLORS } from '@/constants/planCategories';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createSavingsHeaderStyles } from './SavingsHeader.styles';

/** Та же декоративная полоска, что у кошелька в общей шапке (AppHeaderStats). */
const PLAN_STRIP_COLORS = [
  PLAN_CATEGORY_COLORS.need,
  PLAN_CATEGORY_COLORS.want,
  PLAN_CATEGORY_COLORS.save,
];

export function SavingsHeader({
  wallet,
  bank,
  help,
}: {
  /** Кошелёк хаба — корзина «Хочу». */
  wallet: number;
  /** Банк — корзина «Коплю». */
  bank: number;
  /** Подсказка по экрану — кнопка «?» рядом с заголовком. */
  help: ScreenHelpId;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createSavingsHeaderStyles({ theme });

  const handleBack = () => {
    triggerHaptic('light');
    router.navigate('/(tabs)' as never);
  };

  const handleProfilePress = () => {
    triggerHaptic('light');
    router.push('/(tabs)/profile' as never);
  };

  return (
    <View style={styles.row}>
      <View style={styles.leftGroup}>
        <IconButton icon="arrow-back" onPress={handleBack} accessibilityLabel="Назад в комнату" />
        <Text
          style={[styles.title, { fontSize: scaledFont('xxl') }]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          Копилка
        </Text>
        <HelpButton screen={help} />
      </View>

      <View style={styles.rightGroup}>
        <View
          style={[styles.pill, { paddingHorizontal: scale(10), minHeight: scale(44) }]}
          accessible
          accessibilityLabel={`Всего ${formatCoins(wallet + bank)}: в «Хочу» ${formatCoins(wallet)}, в «Коплю» ${formatCoins(bank)}`}
        >
          <Image
            source={FURNITURE_ASSETS.piggybank[0]}
            style={{ width: scale(24), height: scale(20) }}
            contentFit="contain"
          />
          <View style={styles.totalColumn}>
            <Text style={[styles.pillText, { fontSize: scaledFont('lg') }]}>
              {formatPrice(wallet + bank)}
            </Text>
            <View style={styles.planStrip}>
              {PLAN_STRIP_COLORS.map((color) => (
                <View key={color} style={[styles.planStripSegment, { backgroundColor: color }]} />
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleProfilePress}
          activeOpacity={0.8}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          accessibilityRole="button"
          accessibilityLabel="Профиль"
          style={[
            styles.profileButton,
            { width: scale(40), height: scale(40), borderRadius: scale(20) },
          ]}
        >
          <Ionicons name="person" size={scale(20)} color={theme.onGradient} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
