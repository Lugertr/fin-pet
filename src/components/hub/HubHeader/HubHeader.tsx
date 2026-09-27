// src/components/hub/HubHeader/HubHeader.tsx
// Весь хаб — небольшая шапка с названием приложения, комната питомца
// (занимает ВСЁ оставшееся пространство экрана — flex:1, а не фиксированная
// высота, см. PetRoom.styles.ts; ноутбук/копилка сами кликабельны и ведут в
// планирование приключения/«Банк») и одна кнопка под ней: «Начать
// приключение» (аркада — внутри приключения, рядом с заданием). Статы/
// период/дневная награда/совет дня убраны отсюда полностью; ежедневная
// награда — модалка при первом за день заходе (см. app/(tabs)/index.tsx).
// Показывается, только пока нет активного приключения — во время приключения
// на месте хаба экран приключения (см. app/(tabs)/index.tsx), поэтому ни
// баннера «идёт приключение», ни перехода к нему здесь нет.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  // Уроки проходятся только в приключении, поэтому главное действие хаба —
  // начать его (или вернуться к недоделанному планированию).
  const mainCtaLabel =
    adventureStatus === 'active'
      ? 'Продолжить приключение'
      : adventureStatus === 'planning'
        ? 'Продолжить планирование'
        : 'Начать приключение';
  // Во время приключения хаб остаётся хабом — кнопка открывает экран приключения.
  const countdown = useAdventureCountdown();
  const remainingCaption = countdown.active
    ? countdown.expired
      ? 'время вышло — итоги уже скоро'
      : `осталось ${formatDuration(countdown.remaining)}`
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

      {/* CTA: начать приключение (или продолжить его планирование). Аркады
          здесь нет — она открывается внутри приключения, рядом с заданием. */}
      <View style={[styles.ctaRow, { paddingBottom: insets.bottom + scale(spacing.sm) }]}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            router.push(
              (adventureStatus === 'active'
                ? '/(modal)/adventure'
                : '/(modal)/adventure-planning') as never
            );
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
      </View>
    </View>
  );
}
