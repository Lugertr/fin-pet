// src/components/arcade/StartStage/StartStage.tsx
// Этап 1 Аркады — стартовый экран с описанием раунда выбранной мини-игры

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CoinAmount } from '@/components/shared';
import { ScreenFooter } from '@/components/ui';
import { ARCADE_ENERGY_COST } from '@/constants/gameplay';
import { TrainerSession, trainerRoundLength } from '@/domain/arcade/TrainerSelection';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { COINS_PER_CORRECT } from '../arcadeConstants';
import { ARCADE_GAME_META } from '../arcadeGames';
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
  const meta = ARCADE_GAME_META[session.minigameType];
  const total = trainerRoundLength(session);

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
              <Ionicons name={meta.icon} size={scale(56)} color={theme.primary} />
            </View>

            <Text style={[styles.startTitle, { fontSize: scaledFont('title') }]}>{meta.title}</Text>

            <View style={styles.startBadge}>
              <Text style={[styles.startBadgeText, { fontSize: scaledFont('sm') }]}>
                {branchName} • {session.countsAsQuest ? 'Задание приключения' : 'Тренировка'} •{' '}
                {ARCADE_ENERGY_COST}⚡
              </Text>
            </View>

            <Text style={[styles.startDescription, { fontSize: scaledFont('md') }]}>
              {meta.description}
            </Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>
                  {meta.countLabel}
                </Text>
                <Text style={[styles.statValue, { fontSize: scaledFont('xxl') }]}>{total}</Text>
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
                <CoinAmount
                  amount={total * COINS_PER_CORRECT}
                  fontSize={scaledFont('xxl')}
                  textStyle={[styles.statValue, styles.statValueSuccess]}
                />
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
