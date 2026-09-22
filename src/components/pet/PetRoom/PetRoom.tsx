// src/components/pet/PetRoom/PetRoom.tsx
// Комната питомца — рендерит раскладку из domain/room/RoomLayout.ts. Какая
// раскладка используется — определяется экипированным скином комнаты
// (category: 'room' в equippedFurniture, см. useShop.ts) — это товар в
// Магазине/Инвентаре, как и вся остальная мебель, а не отдельная настройка.
// Каждое место (окно/копилка/ноутбук/кровать/ковёр/питомец) — прямоугольник
// в процентах от реальных размеров комнаты, поэтому: 1) хитбоксы кнопок
// ноутбука/копилки — это и есть видимый прямоугольник предмета, без зазоров
// и наложений с соседними местами; 2) все предметы пропорциональны
// фактическому размеру комнаты на конкретном экране, а не фиксированным px.
// Ноутбук/копилка кликабельны — переход в «Учёба»/«Банк». У каждой из
// категорий laptop/piggybank/bed/carpet/window/room есть свой набор
// вариантов арта (см. *_ASSETS ниже) — какой именно показать, определяется
// skin_variant реально экипированного товара этой категории (тот же приём,
// что и у PetSpecies.getBodyAsset для скинов самого питомца).

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PetType } from '@/constants/petAssets';
import { getRoomLayout, roomBoxToStyle } from '@/domain/room/RoomLayout';
import { FURNITURE_CATEGORIES, SHOP_CATALOG, useShopStore } from '@/lib/hooks/useShop';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes } from '@/theme/tokens';
import { MoodIndicator } from '../MoodIndicator';
import { PetSprite } from '../PetSprite';
import { createPetRoomStyles } from './PetRoom.styles';

type FurnitureCategory = (typeof FURNITURE_CATEGORIES)[number];
/** Категории, которые рендерятся как отдельная кликабельная/декоративная
 * «плашка» в комнате (FurnitureChip) — в отличие от room, которая задаёт
 * фон и расстановку всей сцены целиком, а не один объект в ней. */
type ChipCategory = 'laptop' | 'piggybank' | 'bed';

const FURNITURE_ACCENT: Record<ChipCategory, string> = {
  laptop: colorPalettes.indigo[500],
  piggybank: colorPalettes.amber[500],
  bed: colorPalettes.orange[500],
};

const FURNITURE_ASSETS: Record<ChipCategory, Record<number, number>> = {
  laptop: {
    0: require('../../../../assets/images/furniture/laptop.svg'),
    1: require('../../../../assets/images/furniture/laptop-v1.svg'),
    2: require('../../../../assets/images/furniture/laptop-v2.svg'),
  },
  piggybank: {
    0: require('../../../../assets/images/furniture/piggybank.svg'),
    1: require('../../../../assets/images/furniture/piggybank-v1.svg'),
    2: require('../../../../assets/images/furniture/piggybank-v2.svg'),
  },
  bed: {
    0: require('../../../../assets/images/furniture/couch.svg'),
    1: require('../../../../assets/images/furniture/bed-v1.svg'),
    2: require('../../../../assets/images/furniture/bed-v2.svg'),
  },
};

const WINDOW_ASSETS: Record<number, number> = {
  0: require('../../../../assets/images/furniture/window.svg'),
  1: require('../../../../assets/images/furniture/window-v1.svg'),
  2: require('../../../../assets/images/furniture/window-v2.svg'),
};

const CARPET_ASSETS: Record<number, number> = {
  0: require('../../../../assets/images/furniture/carpet.svg'),
  1: require('../../../../assets/images/furniture/carpet-v1.svg'),
  2: require('../../../../assets/images/furniture/carpet-v2.svg'),
};

const ROOM_BACKGROUNDS: Record<number, number> = {
  0: require('../../../../assets/images/furniture/room-background.svg'),
  1: require('../../../../assets/images/furniture/room-background-space.svg'),
};

/** viewBox обоих room-background*.svg — 400×300 (4:3). Сцена комнаты
 * вписывается в доступное место с этим соотношением сторон (см. onLayout
 * ниже), а не растягивается/обрезается под него — иначе зашитая в арт
 * геометрия пола смещалась бы относительно %-координат мебели/питомца
 * при разных пропорциях экрана. */
const ROOM_ASPECT_RATIO = 4 / 3;

interface PetRoomProps {
  petType: PetType;
  petName: string;
  skinVariant?: number;
  mood: number;
  onPetPress?: () => void;
}

export function PetRoom({ petType, petName, skinVariant = 0, mood, onPetPress }: PetRoomProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { triggerHaptic } = useFeedback();
  const equippedFurniture = useShopStore((s) => s.equippedFurniture);

  const styles = createPetRoomStyles({ theme });

  const getFurniture = (category: FurnitureCategory) => {
    const itemId = equippedFurniture[category];
    return SHOP_CATALOG.find((i) => i.id === itemId) ?? null;
  };

  const laptop = getFurniture('laptop');
  const bed = getFurniture('bed');
  const piggybank = getFurniture('piggybank');
  const carpetItem = getFurniture('carpet');
  const windowItem = getFurniture('window');
  const roomItem = getFurniture('room');

  const laptopVariant = laptop?.skin_variant ?? 0;
  const bedVariant = bed?.skin_variant ?? 0;
  const piggybankVariant = piggybank?.skin_variant ?? 0;
  const carpetVariant = carpetItem?.skin_variant ?? 0;
  const windowVariant = windowItem?.skin_variant ?? 0;
  const roomVariant = roomItem?.skin_variant ?? 0;

  const layout = getRoomLayout(roomVariant);

  // Реальный размер сцены комнаты на этом экране — наибольший 4:3
  // прямоугольник, вписанный в доступное место (см. ROOM_ASPECT_RATIO).
  // Нужен и для самого бокса, и для размера питомца (PetSprite принимает
  // size в пикселях, не в процентах, поэтому считаем сами от вписанной,
  // а не от "сырой" ширины контейнера).
  const [roomSize, setRoomSize] = useState({ width: 0, height: 0 });
  const handleRoomLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const fittedWidth = Math.min(width, height * ROOM_ASPECT_RATIO);
    setRoomSize({ width: fittedWidth, height: fittedWidth / ROOM_ASPECT_RATIO });
  };
  const petSize =
    roomSize.width > 0 ? Math.round((roomSize.width * layout.pet.sizePercent) / 100) : 0;

  // Плавающее покачивание мебели — тот же приём, что уже используется для
  // декора и питомца в остальных экранах.
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(-4, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [floatY]);

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const handleOpenLessons = () => {
    triggerHaptic('light');
    router.push('/(tabs)/lessons' as never);
  };

  const handleOpenSavings = () => {
    triggerHaptic('light');
    router.push('/(modal)/savings' as never);
  };

  return (
    <View style={styles.container} onLayout={handleRoomLayout}>
      {roomSize.width > 0 && (
        <View style={[styles.roomBox, { width: roomSize.width, height: roomSize.height }]}>
          <Image
            source={ROOM_BACKGROUNDS[roomVariant] ?? ROOM_BACKGROUNDS[0]}
            style={styles.background}
            contentFit="contain"
          />

          {/* Окно — декоративное, не кликабельно */}
          <View style={roomBoxToStyle(layout.window)} pointerEvents="none">
            <Image
              source={WINDOW_ASSETS[windowVariant] ?? WINDOW_ASSETS[0]}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          </View>

          {/* Ковёр — под питомцем, декоративный */}
          <Image
            source={CARPET_ASSETS[carpetVariant] ?? CARPET_ASSETS[0]}
            style={roomBoxToStyle(layout.carpet)}
            contentFit="fill"
            pointerEvents="none"
          />

          {/* Копилка — кликабельно, переход в «Банк». Хитбокс TouchableOpacity —
              это и есть весь прямоугольник места, без несовпадения с видимой
              картинкой (см. FurnitureChip). */}
          <Animated.View style={[roomBoxToStyle(layout.piggybank), animatedFloatStyle]}>
            <TouchableOpacity
              onPress={handleOpenSavings}
              activeOpacity={0.8}
              style={styles.fillTouchable}
            >
              <FurnitureChip
                category="piggybank"
                variant={piggybankVariant}
                name={piggybank?.name}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Ноутбук — кликабельно, переход в «Учёба» */}
          <Animated.View style={[roomBoxToStyle(layout.laptop), animatedFloatStyle]}>
            <TouchableOpacity
              onPress={handleOpenLessons}
              activeOpacity={0.8}
              style={styles.fillTouchable}
            >
              <FurnitureChip category="laptop" variant={laptopVariant} name={laptop?.name} />
            </TouchableOpacity>
          </Animated.View>

          {/* Кровать — декоративная, без подписи */}
          <Animated.View
            style={[roomBoxToStyle(layout.bed), animatedFloatStyle]}
            pointerEvents="none"
          >
            <FurnitureChip category="bed" variant={bedVariant} />
          </Animated.View>

          {/* Питомец в центре на ковре — размер пропорционален вписанной
              ширине комнаты (см. petSize выше), не показываем до первого
              измерения. */}
          <View style={[styles.petContainer, { bottom: `${layout.pet.bottom}%` }]}>
            {petSize > 0 && (
              <PetSprite
                petType={petType}
                mood={mood}
                skinVariant={skinVariant}
                size={petSize}
                onPress={onPetPress}
              />
            )}
            <View style={styles.petNameBadge}>
              <Text style={styles.petNameText}>{petName}</Text>
            </View>
          </View>

          <View style={styles.moodIndicatorContainer}>
            <MoodIndicator mood={mood} showLabel showTip={false} />
          </View>
        </View>
      )}
    </View>
  );
}

function FurnitureChip({
  category,
  variant,
  name,
}: {
  category: ChipCategory;
  variant: number;
  name?: string;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createPetRoomStyles({ theme });

  return (
    <View
      style={[
        styles.furnitureChip,
        {
          backgroundColor: withAlpha(FURNITURE_ACCENT[category], 0.15),
          borderColor: withAlpha(FURNITURE_ACCENT[category], 0.35),
        },
      ]}
    >
      <Image
        source={FURNITURE_ASSETS[category][variant] ?? FURNITURE_ASSETS[category][0]}
        style={styles.furnitureIconImage}
        contentFit="contain"
      />
      {name && (
        <Text style={[styles.furnitureLabel, { fontSize: scaledFont('xxs') }]} numberOfLines={1}>
          {name}
        </Text>
      )}
    </View>
  );
}
