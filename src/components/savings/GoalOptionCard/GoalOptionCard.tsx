// src/components/savings/GoalOptionCard/GoalOptionCard.tsx
// Карточка цели накопления (макет «Выбери первую цель»): картинка вещи в
// цветной плашке, название, бонус, цена; выбранная — обводка и галочка.
// Общая для онбординга и выбора цели в «Копилке». Выбор передаётся и
// галочкой, и обводкой, и для скринридера (accessibilityState) — не только цветом (§23).

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { ItemImage } from '@/components/shared';
import { ShopItem } from '@/lib/hooks/useShop';
import { goalBonusCaption } from '@/lib/savings/goalOptions';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createGoalOptionCardStyles } from './GoalOptionCard.styles';

export function GoalOptionCard({
  item,
  selected,
  onPress,
}: {
  item: ShopItem;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createGoalOptionCardStyles({ theme });
  const caption = goalBonusCaption(item);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${item.name}, ${caption}, ${formatCoins(item.price)}`}
    >
      <View style={styles.imageBox}>
        <ItemImage item={item} size={scale(40)} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { fontSize: scaledFont('lg') }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.caption, { fontSize: scaledFont('sm') }]} numberOfLines={1}>
          {caption}
        </Text>
      </View>
      <Text style={[styles.price, { fontSize: scaledFont('lg') }]}>{formatPrice(item.price)}</Text>
      {selected && (
        <View style={styles.check}>
          <Ionicons name="checkmark" size={scale(14)} color={theme.onGradient} />
        </View>
      )}
    </TouchableOpacity>
  );
}
