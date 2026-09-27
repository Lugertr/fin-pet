// src/components/profile/AchievementTile/AchievementTile.tsx
// Плитка экрана «Достижения» (макет S32). Открытое — цветная иконка, название,
// «открыто на этой неделе»; если награда ещё не забрана — кнопка «Забрать»
// (§15.1: награда выдаётся только по кнопке). Закрытое — замок, пунктирная
// рамка, условие и прогресс. Состояние передаётся текстом, не только цветом (§23).

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { createAchievementTileStyles } from './AchievementTile.styles';

export function AchievementTile({
  name,
  icon,
  description,
  color,
  isCompleted,
  isClaimed,
  progress,
  unlockedCaption,
  rewardLabel,
  onClaim,
}: {
  name: string;
  icon: string;
  description: string;
  color: string;
  isCompleted: boolean;
  isClaimed: boolean;
  /** 0–100 */
  progress: number;
  unlockedCaption: string;
  /** «+20 C». */
  rewardLabel: string;
  onClaim: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createAchievementTileStyles({ theme });

  if (!isCompleted) {
    return (
      <View
        style={[styles.tile, styles.tileLocked]}
        accessible
        accessibilityLabel={`${name}. Закрыто. ${description}. Прогресс ${progress}%`}
      >
        <View style={[styles.iconBox, { backgroundColor: theme.surfaceLight }]}>
          <Ionicons name="lock-closed-outline" size={scale(22)} color={theme.textMuted} />
        </View>
        <Text style={[styles.titleLocked, { fontSize: scaledFont('lg') }]} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[styles.caption, { fontSize: scaledFont('sm') }]} numberOfLines={3}>
          {description}
        </Text>
        {progress > 0 && (
          <Text style={[styles.caption, { fontSize: scaledFont('sm') }]}>прогресс {progress}%</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.tile}>
      <View
        accessible
        accessibilityLabel={`${name}. ${unlockedCaption}. ${description}`}
        style={styles.tileBody}
      >
        <View style={[styles.iconBox, { backgroundColor: withAlpha(color, 0.18) }]}>
          <Text style={{ fontSize: scaledFont('xxl') }}>{icon}</Text>
        </View>
        <Text style={[styles.title, { fontSize: scaledFont('lg') }]} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[styles.caption, { fontSize: scaledFont('sm') }]} numberOfLines={2}>
          {unlockedCaption}
        </Text>
      </View>
      {!isClaimed && (
        <TouchableOpacity
          onPress={onClaim}
          activeOpacity={0.85}
          style={[styles.claimButton, { backgroundColor: color }]}
          accessibilityRole="button"
          accessibilityLabel={`Забрать награду: ${rewardLabel}`}
        >
          <Text style={[styles.claimText, { fontSize: scaledFont('md') }]}>
            Забрать {rewardLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
