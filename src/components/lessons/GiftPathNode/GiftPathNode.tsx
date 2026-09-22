// src/components/lessons/GiftPathNode/GiftPathNode.tsx
// Узел-подарок в дорожке уроков (§14 ТЗ) — скруглённый квадрат, а не кружок,
// чтобы визуально отличаться от узла-урока. Самодостаточен (как
// ThemeCompleteReward): сам проверяет доступность/claimed и сам создаёт
// подарок при тапе, переиспользуя существующий gift-flow (theme-reward.tsx).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

import { GiftPathNodeContent } from '@/domain/content/LessonContent';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useLessonsStore } from '@/lib/hooks/useLessons';
import { useGiftsStore } from '@/lib/stores/giftsStore';
import { useResponsive, useTheme } from '@/theme';
import { createGiftPathNodeStyles } from './GiftPathNode.styles';

export function GiftPathNode({ node }: { node: GiftPathNodeContent }) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const router = useRouter();
  const { triggerHaptic } = useFeedback();

  const isAvailable = useLessonsStore((s) => s.isGiftNodeAvailable(node.id));
  const isClaimed = useGiftsStore((s) => s.hasClaimedNode(node.id));
  const pendingGift = useGiftsStore((s) => s.pendingGifts.find((g) => g.sourceNodeId === node.id));
  const addGuaranteedChoiceGift = useGiftsStore((s) => s.addGuaranteedChoiceGift);

  const circleSize = scale(60);
  const styles = createGiftPathNodeStyles({ theme, size: circleSize });

  const canPress = isAvailable && !isClaimed;

  const handlePress = () => {
    if (!canPress) return;
    triggerHaptic('success');
    const optionsCount = Math.random() < 0.5 ? 2 : 3;
    const gift =
      pendingGift ??
      addGuaranteedChoiceGift('path_node', optionsCount, node.branch_id, undefined, node.id);
    router.push({ pathname: '/(modal)/theme-reward', params: { giftId: gift.id } } as never);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!canPress}
      activeOpacity={0.8}
      style={[
        styles.box,
        isClaimed ? styles.boxClaimed : isAvailable ? styles.boxAvailable : styles.boxLocked,
      ]}
    >
      {isClaimed ? (
        <Ionicons name="checkmark" size={scale(24)} color={theme.success} />
      ) : isAvailable ? (
        <Text style={{ fontSize: scale(28) }}>🎁</Text>
      ) : (
        <Ionicons name="lock-closed" size={scale(20)} color={theme.textMuted} />
      )}
    </TouchableOpacity>
  );
}
