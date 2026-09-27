// src/components/profile/ProfileMenuCard/ProfileMenuCard.tsx
// Меню экрана «Прогресс» (макет S31): Настройки, Родителям, Словарь,
// Документы — строки с цветной иконкой и стрелкой.

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import type { IconName } from '@/types/icons';
import { useResponsive, useTheme } from '@/theme';
import { createProfileCardStyles } from '../profileCards.styles';

export interface ProfileMenuItem {
  key: string;
  icon: IconName;
  color: string;
  label: string;
  onPress: () => void;
}

export function ProfileMenuCard({ items }: { items: ProfileMenuItem[] }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createProfileCardStyles({ theme });

  return (
    <View style={[styles.card, { paddingVertical: scale(8) }]}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          onPress={item.onPress}
          activeOpacity={0.7}
          style={styles.menuRow}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <Ionicons name={item.icon} size={scale(22)} color={item.color} />
          <Text style={[styles.menuLabel, { fontSize: scaledFont('xl') }]}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={scale(20)} color={theme.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
