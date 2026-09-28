// src/components/lesson/TheoryStep/TheoryStep.tsx
// Шаг «Теория» (новая композиция урока, §9.1) — карточки, по одной за раз.
// Прогресс по карточкам больше не рисуем сами — сквозной прогресс всего
// урока уже показывает LessonStepHeader (StepRunner).

import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { HighlightedText } from '@/components/lesson/HighlightedText';
import { PetAvatarBubble } from '@/components/pet';
import { ScreenFooter } from '@/components/ui';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';

const CARD_PILLS = {
  theory: '★ СОВЕТ СПУТНИКА',
  situation: '📍 СИТУАЦИЯ',
  conclusion: '🏁 ИТОГ',
} as const;

export function TheoryStep({
  cards,
  onDone,
}: {
  /** kind — ситуация урока или заключение: своя плашка и эмоция питомца. */
  cards: { title: string; text: string; bonusFact?: string; kind?: 'situation' | 'conclusion' }[];
  onDone: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const petType = usePreferencesStore((s) => s.petType);
  const skinVariant = usePetStore((s) => s.equippedSkinVariant);
  const styles = createLessonStepsStyles({ theme });

  const [index, setIndex] = useState(0);
  const card = cards[index];
  const isLast = index === cards.length - 1;

  return (
    <View style={styles.stepContainer}>
      <View style={styles.comicScroll}>
        <ScrollView contentContainerStyle={styles.comicScrollContent}>
          <View style={[styles.theoryAvatarBox, { marginBottom: scale(spacing.lg) }]}>
            <PetAvatarBubble
              petType={petType}
              emotion={card.kind === 'conclusion' ? 'reward' : 'question'}
              skinVariant={skinVariant}
              size={88}
            />
          </View>

          <Text
            style={[
              styles.theoryTitle,
              { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.lg) },
            ]}
          >
            {card.title}
          </Text>

          <View style={styles.comicCard}>
            <View style={[styles.theoryTipPill, { marginBottom: scale(spacing.md) }]}>
              <Text style={[styles.theoryTipPillText, { fontSize: scaledFont('xs') }]}>
                {CARD_PILLS[card.kind ?? 'theory']}
              </Text>
            </View>
            <HighlightedText
              text={card.text}
              style={{ color: theme.textSecondary, fontSize: scaledFont('md'), lineHeight: 24 }}
            />
          </View>

          {card.bonusFact && (
            <View style={[styles.theoryBonusBanner, { padding: scale(spacing.md) }]}>
              <Text style={{ fontSize: scaledFont('md') }}>🔖</Text>
              <HighlightedText
                text={card.bonusFact}
                style={{ color: theme.success, fontSize: scaledFont('sm'), flex: 1 }}
              />
            </View>
          )}
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity
          onPress={() => (isLast ? onDone() : setIndex((i) => i + 1))}
          activeOpacity={0.8}
          style={[styles.theoryNextButton, { paddingVertical: scale(spacing.lg) }]}
        >
          <Text style={[styles.theoryNextButtonText, { fontSize: scaledFont('lg') }]}>
            {isLast ? 'Понятно →' : 'Далее →'}
          </Text>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
