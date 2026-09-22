// src/components/adultSection/AppGoalsCard/AppGoalsCard.tsx
// Карточка "Цели приложения" в разделе для взрослого.

import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { createAdultSectionCardsStyles } from '../adultSectionCards.styles';

const APP_GOALS = [
  'Научить ребёнка планировать бюджет: обязательные и необязательные траты.',
  'Сформировать привычку откладывать часть денег на цель — накопления.',
  'Познакомить с признаками мошенничества и правилами финансовой безопасности.',
  'Дать базовые представления об инвестициях, кредитах, налогах и бизнесе.',
];

export function AppGoalsCard() {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createAdultSectionCardsStyles({ theme });

  return (
    <>
      <Text style={[styles.sectionTitle, { fontSize: scaledFont('lg') }]}>Цели приложения</Text>
      <View style={styles.card}>
        {APP_GOALS.map((goal) => (
          <View key={goal} style={styles.goalRow}>
            <Ionicons name="checkmark-circle" size={scale(16)} color={theme.success} />
            <Text style={[styles.goalText, { fontSize: scaledFont('sm') }]}>{goal}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
