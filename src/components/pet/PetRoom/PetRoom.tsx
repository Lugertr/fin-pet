// src/components/pet/PetRoom/PetRoom.tsx
// Комната питомца — рендерит раскладку из domain/room/RoomLayout.ts. Какая
// раскладка используется — определяется экипированным скином комнаты
// (category: 'room' в equippedFurniture, см. useShop.ts) — это товар в
// Магазине/Инвентаре, как и вся остальная мебель, а не отдельная настройка.
// Каждое место (окно/копилка/ноутбук/кровать/ковёр/питомец) — прямоугольник:
// позиция в процентах от комнаты + ширина в процентах, высота — из реального
// соотношения сторон конкретного SVG (см. lib/utils/imageAspectRatio.ts), а
// не подогнанная вручную цифра — поэтому предметы никогда не растягиваются/
// не обрезаются. «Работа» (ноутбук) и «Копилка» кликабельны целиком — и сам
// предмет, и подпись над ним (решение пользователя 29.09.2026): ноутбук ведёт
// в работу (смена идёт — её экран, нет — планирование), копилка — на вкладку
// «Копилка». Рядом с подписью — текущий бонус предметов (суммы из useShop —
// те же, что применяет игра). У каждой из категорий laptop/piggybank/bed/carpet/window/
// room есть свой набор вариантов арта (см. *_ASSETS ниже) — какой именно
// показать, определяется skin_variant реально экипированного товара этой
// категории (тот же приём, что и у PetSpecies.getBodyAsset для скинов самого
// питомца). Карты арта — общие с магазином/инвентарём: constants/itemAssets.ts.
//
// Ширина комнаты — вся доступная ширина контейнера, но не больше
// ROOM_MAX_WIDTH (адаптив под телефон/планшет, см. handleRoomLayout): на
// обычной ширине телефона потолок вообще не срабатывает (сцена остаётся во
// весь экран), а на широких планшетах/десктопе не даёт портретной сцене
// разрастись по высоте до неприличных размеров (реальный фон — портретный,
// см. ROOM_ASPECT_RATIO, без потолка на экране 1000px+ сцена вышла бы за
// 1700px высотой). Высота всегда считается из вписанной ширины через
// реальное соотношение сторон фона — не наоборот. ScrollView — подстраховка
// на случай нетипично низкого окна, где даже вписанная высота не помещается.
//
// Без декоративного фона-плашки/анимации покачивания у мебели и без
// круглой подсветки/анимаций у питомца — по решению пользователя: сцена
// показывает сами предметы как есть, на реальном фоне, ничего лишнего вокруг.

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { openWorkOrExplain } from '@/lib/adventure/openWork';
import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import {
  CARPET_ASSETS,
  FURNITURE_ASSETS,
  ROOM_BACKGROUNDS,
  WINDOW_ASSETS,
} from '@/constants/itemAssets';
import { PetType } from '@/constants/petAssets';
import {
  boxRight,
  getRoomLayout,
  ROOM_ASPECT_RATIO,
  roomBoxToStyle,
} from '@/domain/room/RoomLayout';
import { FURNITURE_CATEGORIES, SHOP_CATALOG, useShopStore } from '@/lib/hooks/useShop';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { getAssetAspectRatio } from '@/lib/utils/imageAspectRatio';
import { useResponsive, useTheme } from '@/theme';
import { PetSprite } from '../PetSprite';
import { createPetRoomStyles } from './PetRoom.styles';

type FurnitureCategory = (typeof FURNITURE_CATEGORIES)[number];

// Соотношение сторон фона (1024×1792) — ROOM_ASPECT_RATIO из domain/room/RoomLayout:
// ширина комнаты — вписанная ширина контейнера, высота считается из неё.

/** Потолок ширины сцены — ниже обычной ширины любого телефона (не влияет на
 * него), но не даёт портретной сцене растягиваться по высоте до неприличных
 * размеров на планшете/десктопе (см. комментарий у файла). */
const ROOM_MAX_WIDTH = 460;

interface PetRoomProps {
  petType: PetType;
  petName: string;
  skinVariant?: number;
  mood: number;
  onPetPress?: () => void;
  /** Подписи мест («Работа», «Энергия», «Копилка»). Тур онбординга
   * скрывает их на шаге про бонусы — там свои выноски. */
  showLabels?: boolean;
}

export function PetRoom({
  petType,
  petName,
  skinVariant = 0,
  mood,
  onPetPress,
  showLabels = true,
}: PetRoomProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { triggerHaptic } = useFeedback();
  const equippedFurniture = useShopStore((s) => s.equippedFurniture);
  // Текущие бонусы предметов — те же суммы, что применяет игра: зарплата
  // смены, бонус копилки к новым монетам, максимум и восстановление энергии.
  const workBonus = useShopStore((s) => s.getTotalCoinBonusPercent());
  const savingsBonus = useShopStore((s) => s.getSavingsBonusRateBonus());
  const energyMaxBonus = useShopStore((s) => s.getTotalEnergyMaxBonus());
  const energyRecoveryBonus = useShopStore((s) => s.getTotalEnergyRecoveryBonus());

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

  const laptopAsset = FURNITURE_ASSETS.laptop[laptopVariant] ?? FURNITURE_ASSETS.laptop[0];
  const bedAsset = FURNITURE_ASSETS.bed[bedVariant] ?? FURNITURE_ASSETS.bed[0];
  const piggybankAsset =
    FURNITURE_ASSETS.piggybank[piggybankVariant] ?? FURNITURE_ASSETS.piggybank[0];
  const windowAsset = WINDOW_ASSETS[windowVariant] ?? WINDOW_ASSETS[0];
  const carpetAsset = CARPET_ASSETS[carpetVariant] ?? CARPET_ASSETS[0];

  // Ширина сцены — вся доступная ширина контейнера, но не больше
  // ROOM_MAX_WIDTH (см. комментарий у файла); высота считается из неё через
  // ROOM_ASPECT_RATIO.
  const [containerWidth, setContainerWidth] = useState(0);
  const roomWidth = Math.min(containerWidth, ROOM_MAX_WIDTH);
  const roomHeight = roomWidth / ROOM_ASPECT_RATIO;
  const handleRoomLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };
  const petSize = roomWidth > 0 ? Math.round((roomWidth * layout.pet.sizePercent) / 100) : 0;

  const handleOpenWork = () => {
    triggerHaptic('light');
    // Ноутбук — вход в работу: идёт смена — её экран, нет — планирование
    // (все уроки пройдены — объяснение, см. openWorkOrExplain).
    openWorkOrExplain();
  };

  const handleOpenSavings = () => {
    triggerHaptic('light');
    // Копилка — вкладка «Копилка» в нижней панели.
    router.navigate('/(tabs)/savings' as never);
  };

  // Бонус рядом с подписью — только если он есть: у стартовых вещей все
  // бонусные поля 0, тогда остаётся одно название места.
  const workBonusText = workBonus > 0 ? `+${workBonus}%` : null;
  const savingsBonusText = savingsBonus > 0 ? `+${savingsBonus}%` : null;
  const energyBonusText =
    energyMaxBonus > 0
      ? `+${energyMaxBonus}⚡`
      : energyRecoveryBonus > 0
        ? `+${energyRecoveryBonus}⚡/ч`
        : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      onLayout={handleRoomLayout}
      showsVerticalScrollIndicator={false}
    >
      {roomWidth > 0 && (
        <View style={[styles.roomBox, { width: roomWidth, height: roomHeight }]}>
          <Image
            source={ROOM_BACKGROUNDS[roomVariant] ?? ROOM_BACKGROUNDS[0]}
            style={styles.background}
            contentFit="contain"
          />

          {/* Окно — декоративное, не кликабельно */}
          <Image
            source={windowAsset}
            style={roomBoxToStyle(layout.window, roomWidth, getAssetAspectRatio(windowAsset))}
            contentFit="contain"
            pointerEvents="none"
          />

          {/* Ковёр — под питомцем, декоративный */}
          <Image
            source={carpetAsset}
            style={roomBoxToStyle(layout.carpet, roomWidth, getAssetAspectRatio(carpetAsset))}
            contentFit="contain"
            pointerEvents="none"
          />

          {/* Кровать — за питомцем (рендерится раньше него по z-order),
              декоративная. */}
          <View
            style={roomBoxToStyle(layout.bed, roomWidth, getAssetAspectRatio(bedAsset))}
            pointerEvents="none"
          >
            <FurnitureChip asset={bedAsset} styles={styles} />
          </View>
          {showLabels && (
            <RoomLabelPill
              top={layout.bed.top}
              right={boxRight(layout.bed)}
              label="Энергия"
              bonus={energyBonusText}
              styles={styles}
            />
          )}

          {/* Копилка — кликабельно, переход на вкладку «Копилка». Хитбокс
              TouchableOpacity — это и есть весь прямоугольник места, без
              несовпадения с видимой картинкой. */}
          <TouchableOpacity
            onPress={handleOpenSavings}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={withBonus('Копилка', savingsBonusText)}
            style={roomBoxToStyle(layout.piggybank, roomWidth, getAssetAspectRatio(piggybankAsset))}
          >
            <FurnitureChip asset={piggybankAsset} styles={styles} />
          </TouchableOpacity>
          {showLabels && (
            <RoomLabelPill
              top={layout.piggybank.top}
              right={boxRight(layout.piggybank)}
              label="Копилка"
              bonus={savingsBonusText}
              onPress={handleOpenSavings}
              styles={styles}
            />
          )}

          {/* Ноутбук — кликабельно, вход в работу */}
          <TouchableOpacity
            onPress={handleOpenWork}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={withBonus('Работа', workBonusText)}
            style={roomBoxToStyle(layout.laptop, roomWidth, getAssetAspectRatio(laptopAsset))}
          >
            <FurnitureChip asset={laptopAsset} styles={styles} />
          </TouchableOpacity>
          {showLabels && (
            <RoomLabelPill
              top={layout.laptop.top}
              left={layout.laptop.left}
              label="Работа"
              bonus={workBonusText}
              onPress={handleOpenWork}
              styles={styles}
            />
          )}

          {/* Питомец в центре на ковре — размер пропорционален вписанной
              ширине комнаты (см. petSize выше), не показываем до первого
              измерения. Контейнер — во всю ширину комнаты и лежит поверх
              копилки: box-none, чтобы касания ловили только сам питомец и
              его имя, а копилка под ним оставалась кликабельной. */}
          <View
            pointerEvents="box-none"
            style={[styles.petContainer, { bottom: `${layout.pet.bottom}%` }]}
          >
            {petSize > 0 && (
              <PetSprite
                petType={petType}
                mood={mood}
                skinVariant={skinVariant}
                size={petSize}
                animateOnPress
                onPress={onPetPress}
              />
            )}
            <View style={styles.petNameBadge}>
              <Text style={styles.petNameText}>{petName}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function FurnitureChip({
  asset,
  styles,
}: {
  asset: number;
  styles: ReturnType<typeof createPetRoomStyles>;
}) {
  return (
    <View style={styles.furnitureChip}>
      <Image source={asset} style={styles.furnitureIconImage} contentFit="contain" />
    </View>
  );
}

/** «Работа, +10%» — для скринридера. */
function withBonus(label: string, bonus: string | null): string {
  return bonus ? `${label}, бонус ${bonus}` : label;
}

/**
 * Пилюля-подсказка над ноутбуком/кроватью/копилкой (см. референс из чата) —
 * что это за место в комнате и, если есть, текущий бонус предметов рядом с
 * названием. С onPress — кнопка (то же действие, что у самого предмета).
 * Висит чуть выше самого предмета — тот же
 * горизонтальный якорь (left ИЛИ right), bottom считается от top предмета,
 * поэтому позиция верна независимо от размера комнаты на экране.
 *
 * Требует, чтобы место было позиционировано через top (не bottom) — так
 * сейчас устроена только раскладка 'classic' (см. RoomLayout.ts); для
 * раскладок с bottom-анкером (сейчас — 'alt') просто не рендерится, чтобы не
 * считать сложную геометрию ради ещё не запрошенной для неё фичи.
 */
function RoomLabelPill({
  top,
  left,
  right,
  label,
  bonus,
  onPress,
  styles,
}: {
  top?: number;
  left?: number;
  right?: number;
  label: string;
  bonus?: string | null;
  onPress?: () => void;
  styles: ReturnType<typeof createPetRoomStyles>;
}) {
  const { scaledFont } = useResponsive();
  if (top === undefined) return null;
  const position = {
    bottom: `${100 - top + 1.5}%` as const,
    ...(left !== undefined ? { left: `${left}%` as const } : {}),
    ...(right !== undefined ? { right: `${right}%` as const } : {}),
  };
  const content = (
    <>
      <Text style={[styles.labelPillText, { fontSize: scaledFont('xs') }]}>{label}</Text>
      {bonus && (
        <Text style={[styles.labelPillBonus, { fontSize: scaledFont('xs') }]}>{bonus}</Text>
      )}
    </>
  );
  if (!onPress) {
    return (
      <View style={[styles.labelPill, position]} pointerEvents="none">
        {content}
      </View>
    );
  }
  // Пилюля невысокая — hitSlop дотягивает зону касания до ≥48 dp (§23).
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={withBonus(label, bonus ?? null)}
      style={[styles.labelPill, position]}
    >
      {content}
    </TouchableOpacity>
  );
}
