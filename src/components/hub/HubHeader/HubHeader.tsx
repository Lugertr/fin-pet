// src/components/hub/HubHeader/HubHeader.tsx
// Весь хаб — небольшая шапка с названием приложения, комната питомца
// (занимает ВСЁ оставшееся пространство экрана — flex:1, а не фиксированная
// высота, см. PetRoom.styles.ts; ноутбук/копилка сами кликабельны и ведут в
// «Учёба»/«Банк») и ровно 2 кнопки под ней: «Пройти урок» и аркада. Статы/
// период/дневная награда/совет дня убраны отсюда полностью — период и
// дневная награда переехали в профиль (см. app/(tabs)/profile.tsx).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetRoom } from '@/components/pet';
import { AppHeaderStats } from '@/components/shared';
import { PetType } from '@/constants/petAssets';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createHubHeaderStyles } from './HubHeader.styles';

export function HubHeader({
  petType,
  petName,
  skinVariant,
  currentMood,
  coins,
  savings,
  onPetPress,
}: {
  petType: PetType;
  petName: string;
  skinVariant: number;
  currentMood: number;
  coins: number;
  savings: number;
  onPetPress: () => void;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const insets = useSafeAreaInsets();
  const styles = createHubHeaderStyles({ theme });

  return (
    <View style={[styles.header, { paddingTop: insets.top + scale(spacing.md) }]}>
      <View style={{ marginBottom: scale(spacing.md) }}>
        <AppHeaderStats energy={currentMood} coins={coins} savings={savings} />
      </View>

      <View style={[styles.roomWrapper, { marginBottom: scale(spacing.md) }]}>
        <PetRoom
          petType={petType}
          petName={petName}
          skinVariant={skinVariant}
          mood={currentMood}
          onPetPress={onPetPress}
        />
      </View>

      {/* CTA: перейти к урокам + быстрый доступ к аркаде */}
      <View style={[styles.ctaRow, { paddingBottom: insets.bottom + scale(spacing.sm) }]}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            router.push('/(tabs)/lessons' as never);
          }}
          activeOpacity={0.85}
          style={[styles.ctaMainButton, { paddingVertical: scale(14) }]}
        >
          <Text style={[styles.ctaMainButtonText, { fontSize: scaledFont('md') }]}>
            Пройти урок
          </Text>
          <Ionicons name="play" size={scale(14)} color={theme.onGradient} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            // Ведёт на экран выбора темы (modal)/arcade-lobby, а не сразу в
            // саму игру: (modal)/arcade ждёт уже готовую TrainerSession в
            // useArcadeSessionStore (её раньше собирал ArcadeTab перед
            // переходом) — без этого шага экран зависал на «Загрузка...».
            router.push('/(modal)/arcade-lobby' as never);
          }}
          activeOpacity={0.85}
          style={[styles.ctaIconButton, { height: scale(48) }]}
        >
          <Ionicons name="game-controller" size={scale(20)} color={theme.warning} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
