// src/components/lesson/CompleteStage/CompleteStage.tsx
// Финальный экран — общий для нового и старого (legacy) потока урока

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { ScreenFooter } from '@/components/ui';
import { useResponsive, useTheme } from '@/theme';
import { circleRadius, emojiSizes, spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';

export function CompleteStage({ onExit, bonusCoins }: { onExit: () => void; bonusCoins: number }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLessonStepsStyles({ theme });

  return (
    <View style={styles.stepContainer}>
      <View style={styles.completeScrollArea}>
        <ScrollView contentContainerStyle={styles.completeScrollContent}>
          <TouchableOpacity activeOpacity={0.8} style={{ marginBottom: scale(spacing.xxl) }}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.completeTrophyBox,
                {
                  width: scale(140),
                  height: scale(140),
                  borderRadius: circleRadius(scale(140)),
                },
              ]}
            >
              <Text style={{ fontSize: scale(emojiSizes.xxxl) }}>🏆</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.completeTitle, { fontSize: scaledFont('hero') }]}>
            Урок пройден!
          </Text>
          <Text style={[styles.completeSubtitle, { fontSize: scaledFont('lg') }]}>
            Вы получили +{bonusCoins} монет за прохождение
          </Text>
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity onPress={onExit} activeOpacity={0.8} style={styles.gradientButton}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
          >
            <Ionicons name="home" size={scale(24)} color={theme.onGradient} />
            <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
              Вернуться в Хаб
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
