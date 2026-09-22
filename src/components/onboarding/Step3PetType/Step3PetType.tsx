// src/components/onboarding/Step3PetType/Step3PetType.tsx
// Шаг 3 онбординга — выбор типа питомца-спутника. Горизонтальная карусель
// карточек (снэп по ширине карточки, следующая карточка «выглядывает» сбоку)
// вместо прежнего ряда из 3 равных карточек — имя питомца сюда больше не
// входит, оно переехало на шаг 4 (Step4PetCustomize) вместе с цветом корпуса.

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { PetSprite } from '@/components/pet';
import { ScrollableRow } from '@/components/ui/ScrollableRow';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, colorPalettes, spacing } from '@/theme/tokens';
import { createOnboardingStepsStyles } from '../onboardingSteps.styles';

export const PET_TYPES = [
  {
    id: 'robot' as const,
    name: 'Робот-Спутник',
    /** Винительный падеж для «Как назовём ...?» — грамматика 3 разных имён не сводится к общему суффиксу. */
    nameAccusative: 'спутник-бота',
    tagline: 'любит порядок и планы',
    accentColor: colorPalettes.indigo[500],
  },
  {
    id: 'dragon' as const,
    name: 'Дракоша',
    nameAccusative: 'дракошу',
    tagline: 'хранитель монет',
    accentColor: colorPalettes.emerald[500],
  },
  {
    id: 'cat' as const,
    name: 'Кот',
    nameAccusative: 'кота',
    tagline: 'верный и любопытный друг',
    accentColor: colorPalettes.amber[500],
  },
];

export type PetType = (typeof PET_TYPES)[number]['id'];

export function Step3PetType({
  petType,
  onChangePetType,
}: {
  petType: PetType;
  onChangePetType: (type: PetType) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const { width: windowWidth } = useWindowDimensions();
  const styles = createOnboardingStepsStyles({ theme });

  const cardWidth = Math.min(windowWidth * 0.72, scale(300));

  return (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Text style={[styles.stepTitle, { fontSize: scaledFont('xxl') }]}>Выбери спутника</Text>
      <Text style={[styles.stepSubtitle, { fontSize: scaledFont('md') }]}>
        Все питомцы одинаково умеют радоваться и подсказывать. Выбор не влияет на игру.
      </Text>

      <ScrollableRow
        snapToInterval={cardWidth + scale(spacing.md)}
        decelerationRate="fast"
        contentContainerStyle={[
          styles.carouselTrackContent,
          { gap: scale(spacing.md), marginBottom: scale(spacing.xxl) },
        ]}
      >
        {PET_TYPES.map((pet) => {
          const isSelected = petType === pet.id;
          return (
            <TouchableOpacity
              key={pet.id}
              onPress={() => {
                triggerHaptic('selection');
                onChangePetType(pet.id);
              }}
              activeOpacity={0.8}
              style={[
                styles.carouselCard,
                isSelected ? styles.carouselCardSelected : styles.carouselCardUnselected,
                { width: cardWidth },
              ]}
            >
              <View style={[styles.petCardInner, { padding: scale(spacing.lg) }]}>
                <View style={styles.petCardTopRow}>
                  {isSelected && (
                    <View
                      style={[
                        styles.petCardCheckmark,
                        {
                          width: scale(22),
                          height: scale(22),
                          borderRadius: circleRadius(scale(22)),
                        },
                      ]}
                    >
                      <Ionicons name="checkmark" size={scale(14)} color={theme.onGradient} />
                    </View>
                  )}
                </View>

                <View
                  style={[
                    styles.petAvatarCircle,
                    {
                      width: scale(96),
                      height: scale(96),
                      borderRadius: circleRadius(scale(96)),
                      backgroundColor: withAlpha(pet.accentColor, 0.1),
                      marginBottom: scale(spacing.sm),
                    },
                  ]}
                >
                  <PetSprite petType={pet.id} mood={100} size={scale(80)} />
                </View>

                <Text
                  style={[
                    styles.petName,
                    { fontSize: scaledFont('md'), marginBottom: scale(spacing.xxs) },
                  ]}
                >
                  {pet.name}
                </Text>
                <Text style={[styles.petTagline, { fontSize: scaledFont('xs') }]}>
                  {pet.tagline}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollableRow>
    </Animated.View>
  );
}
