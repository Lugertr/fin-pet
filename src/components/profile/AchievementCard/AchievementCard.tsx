// src/components/profile/AchievementCard/AchievementCard.tsx
// Карточка достижения (§15 ТЗ) — прогресс/забрать/получено

import { Text } from 'react-native';

import { Badge, Card } from '@/components/ui';
import { AchievementDefinition } from '@/domain/achievement/Achievement';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { Alert } from '@/lib/utils/alert';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createAchievementCardStyles } from './AchievementCard.styles';

export function AchievementCard({
  def,
  status,
  onClaim,
}: {
  def: AchievementDefinition;
  status: { progress: number; isCompleted: boolean; isClaimed: boolean } | undefined;
  onClaim: (id: number) => { success: boolean; message: string };
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();

  const styles = createAchievementCardStyles({ theme });

  const progress = status?.progress ?? 0;
  const isCompleted = status?.isCompleted ?? false;
  const isClaimed = status?.isClaimed ?? false;

  const badgeLabel = isClaimed ? 'Получено' : isCompleted ? 'Забрать' : `${progress}%`;
  const badgeVariant = isClaimed ? 'success' : isCompleted ? 'warning' : 'neutral';

  const handlePress = () => {
    triggerHaptic('light');

    // §15.1: ручной сбор награды по кнопке «Забрать»
    if (isCompleted && !isClaimed) {
      Alert.alert(def.name, `${def.description}\n\nЗабрать награду?`, [
        { text: 'Позже', style: 'cancel' },
        {
          text: 'Забрать',
          onPress: () => {
            const result = onClaim(def.id);
            if (result.success) {
              triggerHaptic('success');
            }
            Alert.alert(result.success ? '🎉 Награда получена!' : 'Не вышло', result.message);
          },
        },
      ]);
      return;
    }

    Alert.alert(
      def.name,
      isClaimed
        ? `${def.description}\n\nДостижение получено! 🎉`
        : `${def.description}\n\nПрогресс: ${progress}%`
    );
  };

  return (
    <Card
      onPress={handlePress}
      padding="md"
      style={[
        styles.achievementCardInner,
        {
          width: scale(110),
          opacity: isClaimed || isCompleted ? 1 : 0.6,
          borderColor: isClaimed ? theme.success : isCompleted ? theme.warning : theme.borderLight,
        },
      ]}
    >
      <Text style={{ fontSize: scaledFont('hero'), marginBottom: scale(spacing.sm) }}>
        {def.icon}
      </Text>
      <Text
        style={[
          styles.achievementTitle,
          { fontSize: scaledFont('sm'), marginBottom: scale(spacing.sm) },
        ]}
        numberOfLines={2}
      >
        {def.name}
      </Text>
      <Badge label={badgeLabel} variant={badgeVariant} size="sm" />
    </Card>
  );
}
