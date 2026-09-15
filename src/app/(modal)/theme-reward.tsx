// Экран открытия подарков с анимацией (с правильным порядком хуков)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { Gift, useGifts } from '@/lib/stores/giftsStore';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { GIFT_RARITY_CONFIGS } from '@/types/gifts';
import { createThemeRewardStyles } from '../../styles/screens/modal/_theme-reward.styles';

export default function ThemeRewardScreen() {
  // ============================================
  // ВСЕ ХУКИ В САМОМ НАЧАЛЕ!
  // ============================================
  const router = useRouter();
  const { giftId } = useLocalSearchParams<{ giftId: string }>();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { trigger, triggerHaptic } = useFeedback();
  const { pendingGifts, openGift } = useGifts();

  const [stage, setStage] = useState<'unopened' | 'opening' | 'revealed'>('unopened');
  const [revealedGift, setRevealedGift] = useState<Gift | null>(null);

  // Анимации
  const giftScale = useSharedValue(1);
  const giftRotate = useSharedValue(0);
  const giftOpacity = useSharedValue(1);

  const styles = createThemeRewardStyles({ theme });

  // Найти подарок по ID (до ранних return!)
  const gift = pendingGifts.find((g) => g.id === giftId);
  const config = gift ? GIFT_RARITY_CONFIGS[gift.rarity] : null;

  // Анимированные стили
  const animatedGiftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: giftScale.value }, { rotate: `${giftRotate.value}deg` }],
    opacity: giftOpacity.value,
  }));

  // ============================================
  // ЭФФЕКТЫ (после хуков, до ранних return)
  // ============================================
  useEffect(() => {
    if (stage === 'opening') {
      // Анимация открытия
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
          setRevealedGift(result);
          trigger('purchase');
        }
      }
    }, 800);
  };

  const handleClaim = () => {
    triggerHaptic('success');
    router.back();
  };

  // ============================================
  // РАННИЕ RETURNS — ПОСЛЕ ВСЕХ ХУКОВ!
  // ============================================

  // Подарок не найден
  if (!gift || !config) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={{ fontSize: scale(64), marginBottom: scale(spacing.lg) }}>🎁</Text>
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

  // Градиент фона в зависимости от темы
  const backgroundGradient: [string, string, string] = ['#1E1B4B', '#312E81', '#4F46E5'];

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
        {/* Этап 1: Закрытый подарок */}
        {stage === 'unopened' && (
          <View style={styles.unopenedContainer}>
            <Text style={[styles.title, { fontSize: scaledFont('title') }]}>Ваш подарок!</Text>
            <Text style={[styles.subtitle, { fontSize: scaledFont('md') }]}>
              {gift.themeName ? `За тему «${gift.themeName}»` : 'Специальный подарок'}
            </Text>

            <Animated.View style={animatedGiftStyle}>
              <TouchableOpacity
                onPress={handleOpenGift}
                activeOpacity={0.8}
                style={{ marginBottom: scale(spacing.xxxl) }}
              >
                <LinearGradient
                  colors={config.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.giftBox,
                    {
                      width: scale(160),
                      height: scale(160),
                      borderRadius: scale(32),
                      shadowColor: config.accentColor,
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.5,
                      shadowRadius: 16,
                      elevation: 12,
                    },
                  ]}
                >
                  <Text style={{ fontSize: scale(80) }}>🎁</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View
              style={[
                styles.rarityBadge,
                {
                  backgroundColor: `${config.accentColor}30`,
                  borderColor: `${config.accentColor}60`,
                },
              ]}
            >
              <Text
                style={[
                  styles.rarityText,
                  { color: config.accentColor, fontSize: scaledFont('lg') },
                ]}
              >
                {config.name} подарок
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleOpenGift}
              activeOpacity={0.8}
              style={[
                styles.openButton,
                { paddingHorizontal: scale(spacing.xxxl), paddingVertical: scale(spacing.lg) },
              ]}
            >
              <Ionicons name="sparkles" size={scale(20)} color="#4F46E5" />
              <Text style={[styles.openButtonText, { fontSize: scaledFont('lg') }]}>
                Открыть подарок
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Этап 2: Анимация открытия */}
        {stage === 'opening' && (
          <Animated.View style={[styles.openingContainer, animatedGiftStyle]}>
            <LinearGradient
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.giftBox,
                {
                  width: scale(160),
                  height: scale(160),
                  borderRadius: scale(32),
                },
              ]}
            >
              <Text style={{ fontSize: scale(80) }}>🎁</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Этап 3: Показ содержимого */}
        {stage === 'revealed' && revealedGift && (
          <View style={styles.revealedContainer}>
            <Text style={[styles.revealedTitle, { fontSize: scaledFont('title') }]}>
              Поздравляем! 🎉
            </Text>
            <Text style={[styles.revealedSubtitle, { fontSize: scaledFont('md') }]}>
              Вы получили:
            </Text>

            {/* Предмет */}
            <LinearGradient
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.itemCard,
                {
                  width: scale(140),
                  height: scale(140),
                  borderRadius: scale(28),
                  marginBottom: scale(spacing.xxl),
                  shadowColor: config.accentColor,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  elevation: 12,
                },
              ]}
            >
              <Text style={{ fontSize: scale(72) }}>{revealedGift.itemIcon}</Text>
            </LinearGradient>

            <Text style={[styles.itemName, { fontSize: scaledFont('xxl') }]}>
              {revealedGift.itemName}
            </Text>

            <View
              style={[
                styles.rarityLabel,
                {
                  backgroundColor: `${config.accentColor}30`,
                  borderColor: `${config.accentColor}60`,
                },
              ]}
            >
              <Text
                style={[
                  styles.rarityLabelText,
                  { color: config.accentColor, fontSize: scaledFont('sm') },
                ]}
              >
                {config.name}
              </Text>
            </View>

            {/* Бонусные монеты */}
            {revealedGift.coins && revealedGift.coins > 0 && (
              <View style={styles.coinsBox}>
                <Ionicons name="wallet" size={scale(18)} color={theme.coins} />
                <Text style={[styles.coinsText, { fontSize: scaledFont('lg') }]}>
                  +{revealedGift.coins} монет
                </Text>
              </View>
            )}

            {/* Кнопка забрать */}
            <TouchableOpacity onPress={handleClaim} activeOpacity={0.8} style={styles.claimButton}>
              <LinearGradient
                colors={['#10B981', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.claimButtonInner, { padding: scale(spacing.lg) }]}
              >
                <Ionicons name="checkmark-circle" size={scale(24)} color="#FFFFFF" />
                <Text style={[styles.claimButtonText, { fontSize: scaledFont('lg') }]}>
                  Забрать в инвентарь
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
