// src/components/pet/PetAvatarBubble/PetAvatarBubble.tsx
// Аватар питомца с эмоцией (радостный/получивший награду/задающий вопрос/
// сожалеющий) — используется в шагах урока. Пробует SVG-ассет эмоции для
// текущего скина (getEmotionAsset) — реально есть только для question/reward,
// по одной паре на каждый скин-вариант; для happy/regretful (и для скина,
// под который ассета ещё нет) — плейсхолдер: базовое эмодзи вида + маленький
// бейдж-эмодзи эмоции в углу (тот же приём, что у PetSprite для 💤/✨).

import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { PET_RENDER_MODE, PetType } from '@/constants/petAssets';
import { EMOTION_BADGE_EMOJI, PetEmotion } from '@/domain/pet/Pet';
import { getPetSpecies } from '@/domain/pet/petSpeciesRegistry';
import { useResponsive, useTheme } from '@/theme';
import { createPetAvatarBubbleStyles } from './PetAvatarBubble.styles';

interface PetAvatarBubbleProps {
  petType: PetType;
  emotion: PetEmotion;
  /** Какой скин надет — у каждого скина свой набор question/reward иконок. */
  skinVariant?: number;
  size?: number;
}

export function PetAvatarBubble({
  petType,
  emotion,
  skinVariant = 0,
  size = 88,
}: PetAvatarBubbleProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();

  const species = getPetSpecies(petType);
  const emotionAsset = species.getEmotionAsset(emotion, skinVariant);
  const baseEmoji = species.getFallbackEmoji('idle');
  const badgeEmoji = EMOTION_BADGE_EMOJI[emotion];

  const styles = createPetAvatarBubbleStyles({ theme, size: scale(size) });

  return (
    <View style={styles.container}>
      {PET_RENDER_MODE === 'assets' && emotionAsset ? (
        <Image source={emotionAsset} style={styles.image} contentFit="contain" transition={200} />
      ) : (
        <>
          <Text style={styles.emoji}>{baseEmoji}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>{badgeEmoji}</Text>
          </View>
        </>
      )}
    </View>
  );
}
