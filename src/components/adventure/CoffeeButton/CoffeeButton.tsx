// src/components/adventure/CoffeeButton/CoffeeButton.tsx
// «Выпить кофе» — квадратная кнопка в левом верхнем углу сцены на экране
// работы (решение пользователя 29.09.2026): раз за смену, из бюджета работы,
// прибавляет энергию (lessons.json: coffee). Сцена всегда светлая, поэтому
// кнопка — светлая карточка в тёплых тонах в обеих темах. Цена и энергия —
// текстом в чипах, а не только цветом (§23). До первого этапа этой смены кофе
// закрыт: замок и «после 1-го этапа».

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { LessonCoffeeContent } from '@/domain/content/LessonContent';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive } from '@/theme';
import { colorPalettes } from '@/theme/tokens';
import { createCoffeeButtonStyles } from './CoffeeButton.styles';

/** Сторона квадрата (≥48 dp, §23). */
const BUTTON_SIZE = 112;
const ICON_CIRCLE_SIZE = 40;

export function CoffeeButton({
  coffee,
  used,
  locked,
  onPress,
}: {
  coffee: LessonCoffeeContent;
  /** Кофе уже был в этой смене. */
  used: boolean;
  /** Ни одного этапа в этой смене ещё не пройдено — кофе пока закрыт
   * (решение 29.09.2026); тап объясняет, когда он откроется. */
  locked: boolean;
  onPress: () => void;
}) {
  const { scale, scaledFont } = useResponsive();
  const styles = createCoffeeButtonStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={used}
      activeOpacity={0.85}
      style={[
        styles.button,
        { width: scale(BUTTON_SIZE), minHeight: scale(BUTTON_SIZE) },
        (used || locked) && styles.buttonUsed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        used
          ? 'Кофе уже выпит в этой смене'
          : locked
            ? 'Кофе откроется после первого этапа этой смены'
            : `Выпить кофе: ${formatCoins(coffee.price)} из бюджета смены, плюс ${coffee.energy} энергии. Один раз за смену`
      }
      accessibilityState={{ disabled: used }}
    >
      <View
        style={[
          styles.iconCircle,
          used && styles.iconCircleUsed,
          {
            width: scale(ICON_CIRCLE_SIZE),
            height: scale(ICON_CIRCLE_SIZE),
          },
        ]}
      >
        <Ionicons
          name={used ? 'checkmark' : locked ? 'lock-closed' : 'cafe'}
          size={scale(22)}
          color={used || locked ? colorPalettes.slate[500] : colorPalettes.amber[700]}
        />
      </View>

      <Text style={[styles.label, { fontSize: scaledFont('md') }]} numberOfLines={1}>
        {used ? 'Кофе выпит' : 'Выпить кофе'}
      </Text>

      {used ? (
        <Text style={[styles.usedHint, { fontSize: scaledFont('sm') }]}>раз за смену</Text>
      ) : locked ? (
        <Text style={[styles.usedHint, { fontSize: scaledFont('sm') }]}>после 1-го этапа</Text>
      ) : (
        <View style={styles.chips}>
          <View style={[styles.chip, styles.priceChip]}>
            <Text style={[styles.chipText, styles.priceText, { fontSize: scaledFont('sm') }]}>
              {formatPrice(coffee.price)}
            </Text>
          </View>
          <View style={[styles.chip, styles.energyChip]}>
            <Text style={[styles.chipText, styles.energyText, { fontSize: scaledFont('sm') }]}>
              +{coffee.energy}
            </Text>
            <Ionicons name="flash" size={scale(12)} color={colorPalettes.orange[500]} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
