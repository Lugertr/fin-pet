// src/components/hub/HubHeader/HubHeader.tsx
// Весь хаб — небольшая шапка с названием приложения, комната питомца
// (занимает ВСЁ оставшееся пространство экрана — flex:1, а не фиксированная
// высота, см. PetRoom.styles.ts; ноутбук/копилка сами кликабельны и ведут в
// планирование смены/«Банк») и кнопки под ней: «Начать работу» (или
// «Продолжить работу» с остатком времени смены) и рядом — Аркада (решение
// пользователя 28.09.2026: переехала из смены на хаб). Статы/период/дневная
// награда/совет дня убраны отсюда полностью; ежедневная награда — модалка при
// первом за день заходе (см. app/(tabs)/index.tsx). В демо-режиме рядом —
// «+1 день» (lib/daily/skipDemoDay): проверить ежедневную награду сразу.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { openWorkOrExplain } from '@/lib/adventure/openWork';
import { skipDemoDay } from '@/lib/daily/skipDemoDay';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetRoom } from '@/components/pet';
import { AppHeaderStats, useAppHeaderPadding } from '@/components/shared';
import { PetType } from '@/constants/petAssets';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { formatDuration } from '@/lib/adventure/formatDuration';
import { useAdventureCountdown } from '@/lib/adventure/useAdventureCountdown';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createHubHeaderStyles } from './HubHeader.styles';

export function HubHeader({
  petType,
  petName,
  skinVariant,
  currentMood,
  coins,
  onPetPress,
}: {
  petType: PetType;
  petName: string;
  skinVariant: number;
  currentMood: number;
  coins: number;
  onPetPress: () => void;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const insets = useSafeAreaInsets();
  // Те же отступы шапки, что и на остальных вкладках — шапка не «прыгает»
  // по высоте при переключении вкладок (см. useAppHeaderPadding).
  const headerPadding = useAppHeaderPadding();
  const styles = createHubHeaderStyles({ theme });
  const adventureStatus = useAdventureStore((s) => s.currentAdventure?.status);
  const isDemo = useUserStore((s) => s.user?.is_demo ?? false);
  // Новые уроки проходятся только в смене, поэтому главное действие хаба —
  // начать её (или вернуться к недоделанному планированию).
  const mainCtaLabel =
    adventureStatus === 'active'
      ? 'Продолжить смену'
      : adventureStatus === 'planning'
        ? 'Продолжить планирование'
        : 'Начать смену';
  // Во время смены хаб остаётся хабом — кнопка открывает экран смены.
  const countdown = useAdventureCountdown();
  const remainingCaption = countdown.active
    ? countdown.expired
      ? 'смена закончилась — итоги уже скоро'
      : `до конца смены ${formatDuration(countdown.remaining)}`
    : null;

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: headerPadding.paddingTop,
          paddingHorizontal: headerPadding.paddingHorizontal,
        },
      ]}
    >
      <View style={{ marginBottom: headerPadding.paddingBottom }}>
        <AppHeaderStats help="hub" energy={currentMood} coins={coins} />
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

      {/* CTA: начать работу (или продолжить её / планирование) и Аркада. */}
      <View style={[styles.ctaRow, { paddingBottom: insets.bottom + scale(spacing.sm) }]}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            openWorkOrExplain();
          }}
          activeOpacity={0.85}
          style={[styles.ctaMainButton, { paddingVertical: scale(14) }]}
          accessibilityRole="button"
          accessibilityLabel={
            remainingCaption ? `${mainCtaLabel}, ${remainingCaption}` : mainCtaLabel
          }
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.ctaMainButtonText, { fontSize: scaledFont('md') }]}>
              {mainCtaLabel}
            </Text>
            {remainingCaption && (
              <Text
                style={[styles.ctaMainButtonText, { fontSize: scaledFont('xs'), opacity: 0.85 }]}
              >
                {remainingCaption}
              </Text>
            )}
          </View>
          <Ionicons name="play" size={scale(14)} color={theme.onGradient} />
        </TouchableOpacity>
        {isDemo && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              skipDemoDay().catch((error) => {
                console.warn('[Hub] Не удалось пропустить день:', error);
                Alert.alert('Не получилось', 'Не удалось пропустить день, попробуй ещё раз');
              });
            }}
            activeOpacity={0.85}
            style={styles.demoDayButton}
            accessibilityRole="button"
            accessibilityLabel="Демо: пропустить день — проверить ежедневную награду"
          >
            <Ionicons name="play-skip-forward" size={scale(18)} color={theme.primary} />
            <Text style={[styles.demoDayText, { fontSize: scaledFont('xs') }]}>+1 день</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            router.push('/(modal)/arcade-lobby' as never);
          }}
          activeOpacity={0.85}
          style={styles.arcadeButton}
          accessibilityRole="button"
          accessibilityLabel="Аркада: мини-игры по темам"
        >
          <Ionicons name="game-controller" size={scale(22)} color={theme.warning} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
