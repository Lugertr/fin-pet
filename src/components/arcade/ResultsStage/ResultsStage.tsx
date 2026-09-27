// src/components/arcade/ResultsStage/ResultsStage.tsx
// Этап 3 Аркады — результаты раунда

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ScreenFooter } from '@/components/ui';
import { formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes, emojiSizes, spacing } from '@/theme/tokens';
import { createResultsStageStyles } from './ResultsStage.styles';

export function ResultsStage({
  correctAnswers,
  totalQuestions,
  coinsEarned,
  onClaimReward,
  onPlayAgain,
}: {
  correctAnswers: number;
  totalQuestions: number;
  coinsEarned: number;
  onClaimReward: () => void;
  onPlayAgain: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createResultsStageStyles({ theme });

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.resultsContainer}>
      <View style={styles.resultsScrollArea}>
        <ScrollView contentContainerStyle={styles.resultsScrollContent}>
          <View style={styles.resultsHeader}>
            <View
              style={[
                styles.resultsIconBox,
                {
                  backgroundColor:
                    accuracy >= 70
                      ? withAlpha(theme.success, 0.15)
                      : withAlpha(theme.warning, 0.15),
                },
              ]}
            >
              <Text style={{ fontSize: scale(emojiSizes.xxxl) }}>
                {accuracy >= 70 ? '🏆' : accuracy >= 50 ? '🎯' : '💪'}
              </Text>
            </View>

            <Text style={[styles.resultsTitle, { fontSize: scaledFont('title') }]}>
              {accuracy >= 70
                ? 'Отличная игра!'
                : accuracy >= 50
                  ? 'Хороший результат!'
                  : 'Продолжай тренироваться!'}
            </Text>

            <Text style={[styles.resultsSubtitle, { fontSize: scaledFont('md') }]}>
              Правильных ответов: {correctAnswers} из {totalQuestions}
            </Text>
          </View>

          <View style={styles.resultsStatsCard}>
            <View style={{ marginBottom: scale(spacing.xl) }}>
              <View style={styles.accuracyRow}>
                <Text style={[styles.accuracyLabel, { fontSize: scaledFont('md') }]}>Точность</Text>
                <Text style={[styles.accuracyValue, { fontSize: scaledFont('xl') }]}>
                  {accuracy}%
                </Text>
              </View>
              <View style={styles.accuracyProgressBar}>
                <LinearGradient
                  colors={
                    accuracy >= 70
                      ? theme.gradients.primary
                      : [colorPalettes.amber[500], colorPalettes.amber[400]]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: `${accuracy}%` }}
                />
              </View>
            </View>

            <View style={styles.coinsEarnedBox}>
              <View style={styles.coinsEarnedLeft}>
                <Text style={[styles.coinsEarnedLabel, { fontSize: scaledFont('lg') }]}>
                  Заработано
                </Text>
              </View>
              <Text style={[styles.coinsEarnedValue, { fontSize: scaledFont('xxl') }]}>
                +{formatPrice(coinsEarned)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <ScreenFooter style={styles.buttonsContainer}>
        <TouchableOpacity onPress={onClaimReward} activeOpacity={0.8} style={styles.gradientButton}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
          >
            <Ionicons name="checkmark-circle" size={scale(24)} color={theme.onGradient} />
            <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
              Забрать награду
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPlayAgain} activeOpacity={0.8} style={styles.secondaryButton}>
          <Ionicons name="refresh" size={scale(22)} color={theme.textPrimary} />
          <Text style={[styles.secondaryButtonText, { fontSize: scaledFont('lg') }]}>
            Играть снова
          </Text>
        </TouchableOpacity>
      </ScreenFooter>
    </Animated.View>
  );
}
