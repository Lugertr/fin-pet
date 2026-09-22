// src/components/onboarding/Step4PetCustomize/Step4PetCustomize.tsx
// Шаг 4 онбординга — «Настрой спутника»: цвет корпуса (реальный скин) + имя.
//
// Свотчи берутся из настоящих скинов выбранного типа питомца (content/items.json,
// category 'skin', pet_type === petType) — variant 0 «Классический» существующие
// ассеты, всегда доступен без покупки; variant 1/2 — покупные скины (см.
// SHOP_CATALOG). Выбранный здесь скин при сабмите достаётся бесплатно (см.
// onboarding.tsx handleSubmit), остальные можно купить позже в магазине.

import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { PetSprite } from '@/components/pet';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { SHOP_CATALOG } from '@/lib/hooks/useShop';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, colorPalettes, spacing } from '@/theme/tokens';
import { createOnboardingStepsStyles } from '../onboardingSteps.styles';
import { PET_TYPES, PetType } from '../Step3PetType';

/** variant 0 не товар (нет записи в content/items.json) — цвет берём на глаз
 * по текущим ассетам вида, чтобы свотч совпадал с реальной картинкой. */
const CLASSIC_SWATCH_COLOR: Record<PetType, string> = {
  robot: colorPalettes.indigo[500],
  dragon: colorPalettes.emerald[500],
  cat: colorPalettes.amber[500],
};

export function getSkinsForPetType(petType: PetType) {
  const purchasable = SHOP_CATALOG.filter(
    (item) => item.category === 'skin' && item.pet_type === petType
  ).sort((a, b) => (a.skin_variant ?? 0) - (b.skin_variant ?? 0));

  return [
    { variant: 0, color: CLASSIC_SWATCH_COLOR[petType], itemId: null as number | null },
    ...purchasable.map((item) => ({
      variant: item.skin_variant as number,
      color: item.swatch_color ?? CLASSIC_SWATCH_COLOR[petType],
      itemId: item.id,
    })),
  ];
}

export function Step4PetCustomize({
  petType,
  colorVariant,
  onChangeColorVariant,
  petName,
  onChangePetName,
}: {
  petType: PetType;
  colorVariant: number;
  onChangeColorVariant: (variant: number) => void;
  petName: string;
  onChangePetName: (value: string) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createOnboardingStepsStyles({ theme });

  const selectedPet = PET_TYPES.find((p) => p.id === petType);
  const skins = getSkinsForPetType(petType);
  const haloColor = skins.find((s) => s.variant === colorVariant)?.color ?? theme.accent;

  return (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Text style={[styles.stepTitle, { fontSize: scaledFont('xxl') }]}>Настрой спутника</Text>
      <Text style={[styles.stepSubtitle, { fontSize: scaledFont('md') }]}>
        Выбери цвет корпуса и придумай имя. Остальные цвета можно будет купить в магазине.
      </Text>

      <View style={[styles.customizePreviewBox, { marginBottom: scale(spacing.xl) }]}>
        <View
          style={[
            styles.petAvatarCircle,
            {
              width: scale(120),
              height: scale(120),
              borderRadius: circleRadius(scale(120)),
              backgroundColor: withAlpha(haloColor, 0.12),
              marginBottom: scale(spacing.md),
            },
          ]}
        >
          <PetSprite petType={petType} mood={100} size={scale(96)} skinVariant={colorVariant} />
        </View>

        <Text
          style={[
            styles.inputLabel,
            { fontSize: scaledFont('sm'), marginBottom: scale(spacing.sm) },
          ]}
        >
          Цвет корпуса
        </Text>
        <View style={styles.swatchRow}>
          {skins.map((swatch) => {
            const isSelected = colorVariant === swatch.variant;
            return (
              <TouchableOpacity
                key={swatch.variant}
                onPress={() => {
                  triggerHaptic('selection');
                  onChangeColorVariant(swatch.variant);
                }}
                activeOpacity={0.8}
                style={[
                  styles.swatchOuter,
                  {
                    width: scale(44),
                    height: scale(44),
                    borderRadius: circleRadius(scale(44)),
                  },
                  isSelected && [styles.swatchOuterSelected, { borderColor: swatch.color }],
                ]}
              >
                <View
                  style={[
                    styles.swatchInner,
                    {
                      width: scale(32),
                      height: scale(32),
                      borderRadius: circleRadius(scale(32)),
                      backgroundColor: swatch.color,
                    },
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={scale(16)} color={theme.onGradient} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.inputContainer, { marginBottom: scale(spacing.xxl) }]}>
        <Text
          style={[
            styles.inputLabel,
            { fontSize: scaledFont('md'), marginBottom: scale(spacing.sm) },
          ]}
        >
          Как назовём {selectedPet?.nameAccusative}?
        </Text>
        <TextInput
          value={petName}
          onChangeText={onChangePetName}
          placeholder="Имя питомца"
          placeholderTextColor={theme.textMuted}
          style={[styles.inputField, { fontSize: scaledFont('lg') }]}
          maxLength={20}
        />
      </View>
    </Animated.View>
  );
}
