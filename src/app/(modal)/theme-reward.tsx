// Экран раскрытия подарков (§14 ТЗ): random — анимация мистери-бокса,
// guaranteed_choice — выбор 1 из предложенных предметов (правильный порядок хуков)
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ChoosingStage, OpeningStage, RevealedStage, UnopenedStage } from '@/components/giftReveal';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { GiftRevealResult, useGifts } from '@/lib/stores/giftsStore';
import { useResponsive, useTheme } from '@/theme';
import { colorPalettes, emojiSizes, spacing } from '@/theme/tokens';
import { getGiftRarityConfig } from '@/types/gifts';
import { createThemeRewardStyles } from '../../styles/screens/modal/_theme-reward.styles';

type Stage = 'unopened' | 'opening' | 'choosing' | 'revealed';

export default function ThemeRewardScreen() {
  // ============================================
  // ВСЕ ХУКИ В САМОМ НАЧАЛЕ!
  // ============================================
  const router = useRouter();
  const { giftId } = useLocalSearchParams<{ giftId: string }>();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();
  const { pendingGifts, openGift, chooseFromGift } = useGifts();

  // Захватываем подарок один раз при монтировании, а не пересчитываем на
  // каждый рендер из живого pendingGifts — иначе openGift/chooseFromGift
  // удаляют его из стора сразу при получении, gift становится undefined ДО
  // того, как stage успевает стать 'revealed', и экран вместо результата
  // показывает «Подарок не найден» (хотя сама выдача уже прошла успешно).
  const [gift] = useState(() => pendingGifts.find((g) => g.id === giftId));

  const [stage, setStage] = useState<Stage>(
    gift?.mode === 'guaranteed_choice' ? 'choosing' : 'unopened'
  );
  const [revealedResult, setRevealedResult] = useState<GiftRevealResult | null>(null);

  const giftScale = useSharedValue(1);
  const giftRotate = useSharedValue(0);
  const giftOpacity = useSharedValue(1);

  const styles = createThemeRewardStyles({ theme });

  const config = getGiftRarityConfig(gift?.rarity ?? null, theme);

  const animatedGiftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: giftScale.value }, { rotate: `${giftRotate.value}deg` }],
    opacity: giftOpacity.value,
  }));

  // ============================================
  // ЭФФЕКТЫ (после хуков, до ранних return)
  // ============================================
  useEffect(() => {
    if (stage === 'opening') {
      giftScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withSpring(1, { damping: 8 }),
        withTiming(1.3, { duration: 200 })
      );
      giftRotate.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      giftOpacity.value = withTiming(0, { duration: 800 }, (finished) => {
        if (finished) {
          runOnJS(setStage)('revealed');
        }
      });
    }
  }, [stage, giftScale, giftRotate, giftOpacity]);

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================
  const handleOpenGift = () => {
    triggerHaptic('medium');
    setStage('opening');

    setTimeout(() => {
      if (gift) {
        const result = openGift(gift.id);
        if (result) {
          setRevealedResult(result);
          trigger('purchase');
        }
      }
    }, 800);
  };

  const handleChoose = (itemId: number) => {
    if (!gift) return;
    triggerHaptic('medium');
    const result = chooseFromGift(gift.id, itemId);
    if (result) {
      setRevealedResult(result);
      trigger('purchase');
      setStage('revealed');
    }
  };

  const handleClaim = () => {
    triggerHaptic('success');
    router.back();
  };

  // ============================================
  // РАННИЕ RETURNS — ПОСЛЕ ВСЕХ ХУКОВ!
  // ============================================
  if (!gift) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={{ fontSize: scale(emojiSizes.xxl), marginBottom: scale(spacing.lg) }}>🎁</Text>
        <Text style={[styles.notFoundTitle, { fontSize: scaledFont('xxl') }]}>
          Подарок не найден
        </Text>
        <Text style={[styles.notFoundText, { fontSize: scaledFont('md') }]}>
          Возможно, он уже был открыт
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.notFoundButton}>
          <Text style={styles.notFoundButtonText}>Вернуться</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const backgroundGradient: [string, string, string] = [
    colorPalettes.indigo[950],
    colorPalettes.indigo[900],
    colorPalettes.indigo[600],
  ];

  // ============================================
  // ОСНОВНОЙ РЕНДЕР
  // ============================================
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {stage === 'unopened' && (
          <UnopenedStage
            gift={gift}
            config={config}
            animatedGiftStyle={animatedGiftStyle}
            onOpen={handleOpenGift}
          />
        )}

        {stage === 'opening' && (
          <View style={styles.centeredStageWrap}>
            <OpeningStage config={config} animatedGiftStyle={animatedGiftStyle} />
          </View>
        )}

        {stage === 'choosing' && (
          <View style={styles.centeredStageWrap}>
            <ChoosingStage gift={gift} onChoose={handleChoose} />
          </View>
        )}

        {stage === 'revealed' && revealedResult && (
          <RevealedStage result={revealedResult} config={config} onClaim={handleClaim} />
        )}
      </LinearGradient>
    </View>
  );
}
