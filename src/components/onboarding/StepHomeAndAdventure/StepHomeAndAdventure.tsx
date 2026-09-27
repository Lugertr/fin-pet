// src/components/onboarding/StepHomeAndAdventure/StepHomeAndAdventure.tsx
// Шаг онбординга «Дом и приключения» (макет «Дом и работа», 27.09.2026):
// два места — два занятия. Дома (хаб, комната) играешь, учишься и копишь;
// в приключении питомец работает, а ты зарабатываешь и решаешь, куда деть
// монеты. Перед туром по комнате (OnboardingRoomTour). Дома — фон комнаты
// со спрайтом питомца поверх, в приключении — готовая сцена work.svg вида и
// скина (питомец уже нарисован за работой).

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { PetSprite } from '@/components/pet';
import type { PetType } from '@/constants/petAssets';
import { getPetSpecies } from '@/domain/pet/petSpeciesRegistry';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes } from '@/theme/tokens';
import { createStepHomeAndAdventureStyles } from './StepHomeAndAdventure.styles';

const ROOM_IMAGE = require('../../../../assets/images/furniture/room-background.svg');

const PLACES = [
  {
    key: 'home',
    chip: 'Уют и развитие',
    chipColor: colorPalettes.emerald[500],
    title: 'Дома',
    text: 'играешь, учишься и копишь',
  },
  {
    key: 'adventure',
    chip: 'Финансы и навыки',
    chipColor: colorPalettes.amber[500],
    title: 'В приключении',
    text: 'питомец работает, а ты зарабатываешь и решаешь, куда деть монеты',
  },
];

export function StepHomeAndAdventure({
  petType,
  skinVariant,
}: {
  petType: PetType;
  skinVariant: number;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createStepHomeAndAdventureStyles({ theme });
  const workImage = getPetSpecies(petType).getWorkAsset(skinVariant);

  return (
    <Animated.View entering={FadeInRight.duration(300)} style={styles.container}>
      <View style={styles.eyebrow}>
        <Text style={[styles.eyebrowText, { fontSize: scaledFont('xs') }]}>● ЗНАКОМСТВО</Text>
      </View>
      <Text style={[styles.title, { fontSize: scaledFont('xxl') }]}>Дом и приключения</Text>
      <Text style={[styles.subtitle, { fontSize: scaledFont('md') }]}>два места — два занятия</Text>

      {PLACES.map((place) => (
        <View key={place.key} style={styles.card}>
          <View style={[styles.imageBox, place.key === 'adventure' && styles.workImageBox]}>
            {place.key === 'home' ? (
              <Image source={ROOM_IMAGE} style={styles.image} contentFit="cover" />
            ) : (
              // work.svg почти квадратная — в широкую рамку вписываем целиком,
              // прижав вправо (слева остаётся место под чип), а поля заливаем
              // её же фоном, чтобы не было шва.
              <Image
                source={workImage}
                style={styles.image}
                contentFit="contain"
                contentPosition="right"
              />
            )}
            <View style={styles.chip}>
              <View style={[styles.chipDot, { backgroundColor: place.chipColor }]} />
              <Text style={[styles.chipText, { fontSize: scaledFont('xs') }]}>{place.chip}</Text>
            </View>
            {place.key === 'home' && (
              <View style={styles.petBox} pointerEvents="none">
                <PetSprite
                  petType={petType}
                  mood={100}
                  skinVariant={skinVariant}
                  height={scale(86)}
                />
              </View>
            )}
          </View>
          <Text style={[styles.cardTitle, { fontSize: scaledFont('xl') }]}>{place.title}</Text>
          <Text style={[styles.cardText, { fontSize: scaledFont('md') }]}>{place.text}</Text>
        </View>
      ))}

      <View style={styles.noteCard}>
        <View style={[styles.noteIcon, { backgroundColor: withAlpha(theme.primary, 0.12) }]}>
          <Ionicons name="heart" size={scale(18)} color={theme.primary} />
        </View>
        <Text style={[styles.noteText, { fontSize: scaledFont('md') }]}>
          без тебя Финни с деньгами не справится
        </Text>
      </View>
    </Animated.View>
  );
}
