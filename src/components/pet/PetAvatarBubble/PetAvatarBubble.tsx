// src/components/pet/PetAvatarBubble/PetAvatarBubble.tsx
// Аватар питомца с эмоцией (радостный/получивший награду/задающий вопрос/
// сожалеющий) — используется в шагах урока. Пробует SVG-ассет эмоции
// (getEmotionAsset), при отсутствии — плейсхолдер: базовое эмодзи вида +
// маленький бейдж-эмодзи эмоции в углу (тот же приём, что у PetSprite для
// 💤/✨). Ассетов эмоций пока нет ни у одного вида — плейсхолдер работает
// всегда, но переключится на реальный SVG сам, как только он появится.

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
  size?: number;
}

export function PetAvatarBubble({ petType, emotion, size = 88 }: PetAvatarBubbleProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();

  const species = getPetSpecies(petType);
  const emotionAsset = species.getEmotionAsset(emotion);
  const baseEmoji = species.getFallbackEmoji('happy');
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
