// src/components/profile/ProgressLevelCard/ProgressLevelCard.tsx
// Карточка уровня (макет S31): «Уровень 2 · Исследователь», XP до
// следующего уровня, полоска прогресса. Внизу слева — облик питомца (новый
// облик открывается на уровнях 2 и 3), справа — откуда берётся опыт: только
// из завершённых приключений (уроки дают монеты, но не XP).

import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { useResponsive, useTheme } from '@/theme';
import { createProfileCardStyles } from '../profileCards.styles';

export function ProgressLevelCard({
  level,
  title,
  xpIntoLevel,
  xpForNext,
  lookStage,
  lookStagesTotal,
}: {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForNext: number;
  lookStage: number;
  lookStagesTotal: number;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createProfileCardStyles({ theme });
  const percent = xpForNext > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100)) : 0;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`Уровень ${level}, ${title}. ${xpIntoLevel} из ${xpForNext} опыта до следующего уровня`}
    >
      <View style={styles.levelHeaderRow}>
        <Text style={[styles.cardTitle, { fontSize: scaledFont('lg'), flexShrink: 1 }]}>
          Уровень {level} · {title}
        </Text>
        <Text style={[styles.levelXpText, { fontSize: scaledFont('sm') }]}>
          {xpIntoLevel} / {xpForNext} XP
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.levelFooterRow}>
        <Text style={[styles.levelStageText, { fontSize: scaledFont('sm') }]}>
          облик {lookStage}/{lookStagesTotal}
        </Text>
        <Text style={[styles.captionText, { fontSize: scaledFont('sm') }]}>XP за приключения</Text>
      </View>
    </View>
  );
}
