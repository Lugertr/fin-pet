// src/app/(modal)/arcade-lobby.tsx
// Экран выбора темы для Аркады: кнопка «Начать тренировку» (случайная тема
// из пройденных) + список пройденных тем с возможностью исключить тему из
// случайного выбора. Сама игра (§10 ТЗ) — отдельный экран (modal)/arcade.tsx,
// сюда не относится; этот экран только готовит сессию и передаёт её туда.
//
// Раньше это была вкладка «Аркада» внутри экрана Уроков (переключалась
// рельсой слева) — теперь свой экран, открывается напрямую с Хаба (см.
// HubHeader.tsx), а рельса в Уроках убрана как больше не нужная (Аркада и
// так открывается сразу с Хаба).

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { ArcadeTab } from '@/components/lessons';
import { IconButton } from '@/components/ui';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createArcadeStyles } from '../../styles/screens/arcade/_[id].styles';

export default function ArcadeLobbyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createArcadeStyles({ theme });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.lg) }]}
      >
        <IconButton icon="arrow-back" onPress={() => router.back()} variant="onGradient" />
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { fontSize: scaledFont('lg') }]} numberOfLines={1}>
            Аркада
          </Text>
        </View>
        <View style={{ width: scale(36) }} />
      </LinearGradient>

      <ArcadeTab />
    </View>
  );
}
