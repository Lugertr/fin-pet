// src/components/shared/AppHeaderStats/AppHeaderStats.tsx
// Единая шапка приложения — на всех вкладках таб-бара (хаб/уроки/магазин/
// ИИ-чат/профиль), кроме онбординга. Лого + 3 бейджа статов (энергия/коины/
// накопления) + кнопка перехода в профиль. Принимает уже посчитанные
// значения — экран сам решает, откуда их брать (сторы отличаются по экранам).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { formatCoins } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createAppHeaderStatsStyles } from './AppHeaderStats.styles';

export function AppHeaderStats({
  energy,
  coins,
  savings,
}: {
  energy: number;
  coins: number;
  savings: number;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createAppHeaderStatsStyles({ theme });

  const handleProfilePress = () => {
    triggerHaptic('light');
    router.push('/(tabs)/profile' as never);
  };

  return (
    <View style={styles.row}>
      <Text style={[styles.logoText, { fontSize: scaledFont('lg') }]}>Финни</Text>

      <View style={styles.rightGroup}>
        <View style={styles.statBadgesRow}>
          <View style={[styles.statBadge, { paddingHorizontal: scale(8) }]}>
            <Ionicons name="wallet" size={scale(12)} color={theme.coins} />
            <Text style={[styles.statBadgeText, { fontSize: scaledFont('xxs') }]}>
              {formatCoins(coins)}
            </Text>
          </View>
          <View style={[styles.statBadge, { paddingHorizontal: scale(8) }]}>
            <Ionicons name="business" size={scale(12)} color={theme.success} />
            <Text style={[styles.statBadgeText, { fontSize: scaledFont('xxs') }]}>
              {formatCoins(savings)}
            </Text>
          </View>
          <View style={[styles.statBadge, { paddingHorizontal: scale(8) }]}>
            <Ionicons name="flash" size={scale(12)} color={theme.warning} />
            <Text style={[styles.statBadgeText, { fontSize: scaledFont('xxs') }]}>
              {Math.round(energy)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleProfilePress}
          activeOpacity={0.8}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          style={[
            styles.profileButton,
            { width: scale(36), height: scale(36), borderRadius: scale(18) },
          ]}
        >
          <Ionicons name="person" size={scale(18)} color={theme.onGradient} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
