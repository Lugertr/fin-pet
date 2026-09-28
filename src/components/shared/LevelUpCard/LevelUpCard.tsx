// src/components/shared/LevelUpCard/LevelUpCard.tsx
// «Новый уровень» (§8.4): звание и что именно получено — только реально
// выданное (монеты, облик питомца). Показывается на экране награды урока —
// опыт дают уроки.

import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';

import { getLevelTitle } from '@/domain/player/PlayerLevel';
import type { LevelUpResult } from '@/lib/hooks/useLessons';
import { formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createLevelUpCardStyles } from './LevelUpCard.styles';

export function LevelUpCard({ levelUp }: { levelUp: LevelUpResult }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLevelUpCardStyles({ theme });

  return (
    <Animated.View entering={ZoomIn.duration(400)} style={styles.card}>
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
            Новый облик питомца: {levelUp.skinName}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}
