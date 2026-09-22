// src/components/profile/SettingsRow/SettingsRow.tsx
// Строка настроек (используется и в общем блоке настроек, и в блоке
// «Помощь»/«О приложении»/«Для взрослых»)

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { spacing } from '@/theme/tokens';
import type { IconName } from '@/types/icons';
import { createSettingsRowStyles } from './SettingsRow.styles';

export function SettingsRow({
  icon,
  label,
  value,
  danger,
  isLast,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  danger?: boolean;
  isLast?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createSettingsRowStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.settingsRow,
        {
          padding: scale(spacing.lg),
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: theme.divider,
        },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <View
          style={[
            styles.settingsIconBox,
            {
              backgroundColor: danger
                ? withAlpha(theme.error, 0.15)
                : withAlpha(theme.primary, 0.15),
            },
          ]}
        >
          <Ionicons name={icon} size={scale(18)} color={danger ? theme.error : theme.primary} />
        </View>
        <Text
          style={[
            styles.settingsLabel,
            {
              color: danger ? theme.error : theme.textPrimary,
              fontSize: scaledFont('lg'),
            },
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(spacing.sm) }}>
        {value && (
          <Text style={{ color: theme.textSecondary, fontSize: scaledFont('md') }}>{value}</Text>
        )}
        <Ionicons name="chevron-forward" size={scale(16)} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );
}
