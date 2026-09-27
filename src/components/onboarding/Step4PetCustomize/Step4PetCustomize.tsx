// src/components/onboarding/Step4PetCustomize/Step4PetCustomize.tsx
// Шаг 4 онбординга — «Настрой спутника»: цвет корпуса (реальный скин) + имя.
//
// Свотчи берутся из настоящих скинов выбранного типа питомца (getSkinsForPetType,
// content/items.json, category 'skin', pet_type === petType): variant 0 —
// «Классический», 1/2 — цветные. Выбранный здесь облик при сабмите кладётся в
// инвентарь (см. onboarding.tsx handleSubmit); два остальных питомец получит
// на уровнях 2 и 3 (PlayerLevel.pickLookToGrant). Облики не продаются.

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '@/components/ui/Text';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { PetSprite } from '@/components/pet';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { getSkinsForPetType } from '@/lib/pet/petSkin';
import { useResponsive, useTheme } from '@/theme';
import { circleRadius, spacing } from '@/theme/tokens';
import { createOnboardingStepsStyles } from '../onboardingSteps.styles';
import { PET_TYPES, PetType } from '../Step3PetType';

/** Высота питомца в превью — одинаковая для всех видов. */
const PREVIEW_HEIGHT = 150;

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

  return (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Text style={[styles.stepTitle, { fontSize: scaledFont('xxl') }]}>Настрой спутника</Text>
      <Text style={[styles.stepSubtitle, { fontSize: scaledFont('md') }]}>
        Выбери облик и придумай имя. Два других облика питомец получит на 2-м и 3-м уровне.
      </Text>

      <View style={[styles.customizePreviewBox, { marginBottom: scale(spacing.xl) }]}>
        {/* Рамка ровно по высоте питомца (подгонка по высоте): раньше
            высокий спрайт в квадратной рамке 120 вылезал вверх — на
            подзаголовок — и вниз. Высота та же у всех видов. */}
        <View
          style={[
            styles.petAvatarCircle,
            {
              height: scale(PREVIEW_HEIGHT),
              marginTop: scale(spacing.md),
              marginBottom: scale(spacing.md),
            },
          ]}
        >
          <PetSprite
            petType={petType}
            mood={100}
            height={scale(PREVIEW_HEIGHT)}
            skinVariant={colorVariant}
            animateOnPress
          />
        </View>

        <Text
          style={[
            styles.inputLabel,
            {
              fontSize: scaledFont('sm'),
              marginTop: scale(spacing.md),
              marginBottom: scale(spacing.sm),
            },
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
