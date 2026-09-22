// src/components/hub/DailyRewardCard/DailyRewardCard.tsx
// Ежедневная награда + мини-календарь стрика

import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';

import { StreakDayCircle } from '@/components/shared';
import { SectionTitle } from '@/components/ui';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, colorPalettes, spacing } from '@/theme/tokens';
import { createDailyRewardCardStyles } from './DailyRewardCard.styles';

const STREAK_DAYS = [1, 2, 3, 4, 5, 6, 7];

export function DailyRewardCard({
  currentStreak,
  hasClaimedToday,
  onClaim,
  isDark,
}: {
  currentStreak: number;
  hasClaimedToday: boolean;
  onClaim: () => void;
  isDark: boolean;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createDailyRewardCardStyles({ theme });

  return (
    <View
      style={[
        styles.dailySection,
        { paddingHorizontal: scale(spacing.xxl), paddingBottom: scale(spacing.lg) },
      ]}
    >
      <SectionTitle>Ежедневная награда</SectionTitle>

      <TouchableOpacity
        onPress={onClaim}
        disabled={hasClaimedToday}
        activeOpacity={0.8}
        style={[styles.dailyCard, { opacity: hasClaimedToday ? 0.6 : 1 }]}
      >
        <LinearGradient
          colors={
            hasClaimedToday
              ? isDark
                ? [colorPalettes.slate[700], colorPalettes.slate[800]]
                : [colorPalettes.slate[200], colorPalettes.slate[300]]
              : theme.gradients.reward
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.dailyCardInner, { padding: scale(spacing.xl) }]}
        >
          <View style={[styles.dailyLeftRow, { gap: scale(spacing.md) }]}>
            <View
              style={[
                styles.dailyIconBox,
                { width: scale(48), height: scale(48), borderRadius: circleRadius(scale(48)) },
              ]}
            >
              <Text style={{ fontSize: scaledFont('xxxl') }}>{hasClaimedToday ? '✓' : '🎁'}</Text>
            </View>
            <View>
              <Text style={[styles.dailyTitle, { fontSize: scaledFont('lg') }]}>
                {hasClaimedToday ? 'Награда получена' : 'Забрать награду'}
              </Text>
              <Text style={[styles.dailySubtitle, { fontSize: scaledFont('sm') }]}>
                День {currentStreak + (hasClaimedToday ? 0 : 1)} из 7
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.dailyButton,
              {
                backgroundColor: hasClaimedToday
                  ? withAlpha(theme.onGradient, 0.1)
                  : withAlpha(theme.onGradient, 0.25),
                paddingHorizontal: scale(spacing.lg),
                paddingVertical: scale(spacing.sm),
              },
            ]}
          >
            <Text style={[styles.dailyButtonText, { fontSize: scaledFont('md') }]}>
              {hasClaimedToday ? 'Получено' : 'Забрать'}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Мини-календарь стрика */}
      <View style={[styles.streakRow, { marginTop: scale(spacing.lg) }]}>
        {STREAK_DAYS.map((day) => {
          const isCompleted = day <= currentStreak;
          const isToday = day === currentStreak + 1 && !hasClaimedToday;
          const isSuperCase = day === 7;

          return (
            <View key={day} style={styles.streakDayContainer}>
              <StreakDayCircle
                day={day}
                isCompleted={isCompleted}
                isToday={isToday}
                isSuperCase={isSuperCase}
                size={32}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
