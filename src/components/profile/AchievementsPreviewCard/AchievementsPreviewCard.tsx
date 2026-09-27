// src/components/profile/AchievementsPreviewCard/AchievementsPreviewCard.tsx
// Превью достижений на экране «Прогресс» (макет S31): до трёх последних
// открытых достижений и ссылка «все достижения» на отдельный экран.

import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { radius } from '@/theme/tokens';
import { createProfileCardStyles } from '../profileCards.styles';

export interface AchievementPreviewItem {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export function AchievementsPreviewCard({
  items,
  hasUnclaimed,
  onViewAll,
}: {
  items: AchievementPreviewItem[];
  /** Есть выполненные, но не забранные награды — подсказка у ссылки. */
  hasUnclaimed: boolean;
  onViewAll: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createProfileCardStyles({ theme });

  return (
    <View style={styles.card}>
      <Text style={[styles.cardTitle, { fontSize: scaledFont('lg') }]}>Достижения</Text>

      {items.length > 0 ? (
        <View style={styles.achievementsRow}>
          {items.map((item) => (
            <View key={item.id} style={styles.achievementPreviewItem}>
              <View
                style={{
                  width: scale(40),
                  height: scale(40),
                  borderRadius: scale(radius.md),
                  backgroundColor: withAlpha(item.color, 0.15),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: scaledFont('xl') }}>{item.icon}</Text>
              </View>
              <Text
                style={[
                  styles.achievementPreviewName,
                  { color: item.color, fontSize: scaledFont('sm') },
                ]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
          Первое достижение ещё впереди
        </Text>
      )}

      <TouchableOpacity
        onPress={onViewAll}
        style={styles.linkButton}
        accessibilityRole="button"
        accessibilityLabel={
          hasUnclaimed ? 'Все достижения, есть награды, которые можно забрать' : 'Все достижения'
        }
      >
        <Text style={[styles.linkText, { fontSize: scaledFont('lg') }]}>
          {hasUnclaimed ? 'все достижения · есть награды' : 'все достижения'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
