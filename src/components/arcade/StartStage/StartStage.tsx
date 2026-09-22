// src/components/arcade/StartStage/StartStage.tsx
// Этап 1 Аркады — стартовый экран с описанием раунда

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ScreenFooter } from '@/components/ui';
import { ARCADE_ENERGY_COST } from '@/constants/gameplay';
import { TrainerSession } from '@/domain/arcade/TrainerSelection';
import { formatCoins } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { COINS_PER_CORRECT } from '../arcadeConstants';
import { createStartStageStyles } from './StartStage.styles';

export function StartStage({
  session,
  branchName,
  onStart,
}: {
  session: TrainerSession;
  branchName: string;
  onStart: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createStartStageStyles({ theme });

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.startContainer}>
      <View style={styles.startScrollArea}>
        <ScrollView contentContainerStyle={styles.startScrollContent}>
          <View style={styles.startHeader}>
            <View
              style={[
                styles.startIconBox,
                {
                  width: scale(120),
                  height: scale(120),
                  borderRadius: scale(32),
                  marginBottom: scale(spacing.xl),
                },
              ]}
            >
              <Ionicons
                name={session.minigameType === 'quiz' ? 'help-circle' : 'swap-horizontal'}
                size={scale(56)}
                color={theme.primary}
              />
            </View>

            <Text style={[styles.startTitle, { fontSize: scaledFont('title') }]}>{branchName}</Text>

            <View style={styles.startBadge}>
              <Text style={[styles.startBadgeText, { fontSize: scaledFont('sm') }]}>
                Случайная тема • Стоимость: {ARCADE_ENERGY_COST}⚡ за игру
              </Text>
            </View>

            <Text style={[styles.startDescription, { fontSize: scaledFont('md') }]}>
              {session.minigameType === 'quiz'
                ? 'Отвечайте на вопросы и получайте монеты!'
                : 'Свайпайте карточки и получайте монеты!'}
            </Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>Вопросов</Text>
                <Text style={[styles.statValue, { fontSize: scaledFont('xxl') }]}>
                  {session.questions.length}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>За ответ</Text>
                <Text
                  style={[styles.statValue, styles.statValueCoins, { fontSize: scaledFont('xxl') }]}
                >
                  +{COINS_PER_CORRECT}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>Максимум</Text>
                <Text
                  style={[
                    styles.statValue,
                    styles.statValueSuccess,
                    { fontSize: scaledFont('xxl') },
                  ]}
                >
                  {formatCoins(session.questions.length * COINS_PER_CORRECT)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity onPress={onStart} activeOpacity={0.8} style={styles.gradientButton}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
          >
            <Ionicons name="play" size={scale(24)} color={theme.onGradient} />
            <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
              Начать игру
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScreenFooter>
    </Animated.View>
  );
}
