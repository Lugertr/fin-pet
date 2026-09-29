// src/components/shared/LevelUpCard/LevelUpCard.tsx
// «Новый уровень» (§8.4): звание и что именно получено — только реально
// выданное (монеты, облик питомца). Показывается в окне «Опыт и уровень» на
// хабе после итогов смены и на экране награды урока вне смены — опыт дают
// уроки.
// Новый облик лежит в хранилище и сам не надевается (решение пользователя
// 29.09.2026): карточка предлагает «Надеть» или «Оставить текущий».

import { useState } from 'react';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';

import { Button } from '@/components/ui';
import { getLevelTitle } from '@/domain/player/PlayerLevel';
import type { LevelUpResult } from '@/lib/hooks/useLessons';
import { SHOP_CATALOG } from '@/lib/hooks/useShop';
import { equipSkin } from '@/lib/pet/petSkin';
import { usePetStore } from '@/lib/stores/petStore';
import { Alert } from '@/lib/utils/alert';
import { formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createLevelUpCardStyles } from './LevelUpCard.styles';

type LookChoice = 'offer' | 'equipping' | 'equipped' | 'kept';

export function LevelUpCard({ levelUp }: { levelUp: LevelUpResult }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLevelUpCardStyles({ theme });
  const equippedVariant = usePetStore((s) => s.equippedSkinVariant);
  const [choice, setChoice] = useState<LookChoice>('offer');

  const look =
    levelUp.skinItemId !== null ? SHOP_CATALOG.find((i) => i.id === levelUp.skinItemId) : undefined;
  // Облик уже надели (здесь или в хранилище) — предлагать нечего.
  const lookWorn = look !== undefined && look.skin_variant === equippedVariant;

  const handleEquip = async () => {
    if (!look) return;
    setChoice('equipping');
    const result = await equipSkin(look);
    if (result.success) {
      setChoice('equipped');
    } else {
      setChoice('offer');
      Alert.alert('Не получилось', result.message);
    }
  };

  const lookStatus =
    choice === 'kept'
      ? 'Облик ждёт в хранилище — надеть его можно в любой момент.'
      : lookWorn
        ? 'Новый облик уже на питомце.'
        : null;

  return (
    <Animated.View entering={ZoomIn.duration(400)} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={{ fontSize: scale(32) }}>🎉</Text>
        <View style={styles.body}>
          <Text style={[styles.title, { fontSize: scaledFont('lg') }]}>
            Новый уровень {levelUp.to}: «{getLevelTitle(levelUp.to)}»
          </Text>
          {levelUp.coins > 0 && (
            <Text style={[styles.text, { fontSize: scaledFont('md') }]}>
              Награда: +{formatPrice(levelUp.coins)}
            </Text>
          )}
          {levelUp.skinName && (
            <Text style={[styles.text, { fontSize: scaledFont('md') }]}>
              В хранилище открылся новый облик: «{levelUp.skinName}»
            </Text>
          )}
        </View>
      </View>

      {look && lookStatus && (
        <Text style={[styles.lookStatus, { fontSize: scaledFont('md') }]}>{lookStatus}</Text>
      )}
      {look && !lookStatus && choice !== 'equipped' && (
        <View style={styles.lookActions}>
          <Button
            title="Надеть"
            icon="shirt-outline"
            onPress={() => void handleEquip()}
            loading={choice === 'equipping'}
          />
          <Button
            title="Оставить текущий"
            variant="secondary"
            onPress={() => setChoice('kept')}
            disabled={choice === 'equipping'}
          />
        </View>
      )}
    </Animated.View>
  );
}
