// src/components/profile/ParentZoneCard/ParentZoneCard.tsx
// «Зона для родителей» — акцентная карточка-вход в раздел для взрослого,
// заменяет прежнюю строку «Для взрослых» в общем блоке настроек (§17 ТЗ).
// Навигация не меняется — тот же router.push('/(modal)/adult-section').

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { createParentZoneCardStyles } from './ParentZoneCard.styles';

export function ParentZoneCard({ onPress }: { onPress: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createParentZoneCardStyles({ theme });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="lock-closed" size={scale(20)} color={theme.textSecondary} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.title, { fontSize: scaledFont('lg') }]}>Зона для родителей</Text>
        <Text style={[styles.subtitle, { fontSize: scaledFont('sm') }]}>
          Цели, прогресс, настройки и сброс профиля
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={scale(20)} color={theme.textMuted} />
    </TouchableOpacity>
  );
}
