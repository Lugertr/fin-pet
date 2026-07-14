import { useGameStore } from '@/app/providers/store';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export function RewardAnimation() {
  const { lastRewardAnimation, clearRewardAnimation } = useGameStore();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lastRewardAnimation) return;

    // Сброс значений
    scaleAnim.setValue(0);
    translateYAnim.setValue(0);
    opacityAnim.setValue(0);

    // Анимация появления и подъёма
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(translateYAnim, {
        toValue: -100,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      clearRewardAnimation();
    });
  }, [lastRewardAnimation]);

  if (!lastRewardAnimation) return null;

  const getContent = () => {
    switch (lastRewardAnimation.type) {
      case 'coins':
        return { emoji: '🪙', text: `+${lastRewardAnimation.value}` };
      case 'achievement':
        return { emoji: '🏆', text: String(lastRewardAnimation.value) };
      case 'level_up':
        return { emoji: '⭐', text: `Уровень ${lastRewardAnimation.value}!` };
      default:
        return { emoji: '✨', text: '' };
    }
  };

  const { emoji, text } = getContent();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.text}>{text}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  emoji: {
    fontSize: 80,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
