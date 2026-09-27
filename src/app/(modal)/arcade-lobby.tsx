// src/app/(modal)/arcade-lobby.tsx
// Аркада приключения (решение пользователя 27.09.2026): открывается кнопкой
// рядом с «Выполнить задание» и даёт сыграть в любую мини-игру по теме
// (компетенции) текущего приключения — «Викторину», «Свайпы» или «5 букв».
// Каждая игра — 10⚡, +2 C за верный ответ и до 15 минут ускорения
// приключения (слабее урока-задания, −45); заданием она не считается. Сама игра — (modal)/arcade.tsx; этот экран
// только собирает раунд и передаёт его туда через useArcadeSessionStore.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { ARCADE_GAME_META, COINS_PER_CORRECT } from '@/components/arcade';
import { BRANCH_GRADIENTS } from '@/components/lessons/branchVisuals';
import { HelpButton } from '@/components/shared';
import { IconButton } from '@/components/ui';
import { ARCADE_ENERGY_COST } from '@/constants/gameplay';
import {
  ArcadeGameType,
  buildBranchGameSession,
  listBranchGames,
} from '@/domain/arcade/TrainerSelection';
import { ARCADE_SOURCES } from '@/lib/arcade/arcadeSources';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { useArcadeSessionStore } from '@/lib/stores/arcadeSessionStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { spacing } from '@/theme/tokens';
import { createArcadeStyles } from '../../styles/screens/arcade/_[id].styles';

export default function ArcadeLobbyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createArcadeStyles({ theme });

  const adventure = useAdventureStore((s) => s.currentAdventure);
  // §18 демо-режим — короткие раунды (DEMO_ROUND_LIMIT).
  const isDemo = useUserStore((s) => s.user?.is_demo ?? false);
  const branchId = adventure?.status === 'active' ? adventure.branchId : null;
  const branch = branchId !== null ? BRANCHES.find((b) => b.id === branchId) : undefined;
  const games = branchId !== null ? listBranchGames(branchId, ARCADE_SOURCES, isDemo) : [];
  const accent = (branchId !== null && BRANCH_GRADIENTS[branchId]?.[0]) || theme.primary;

  const handlePlay = (type: ArcadeGameType) => {
    if (branchId === null) return;
    const session = buildBranchGameSession(type, branchId, ARCADE_SOURCES, false, isDemo);
    if (!session) {
      Alert.alert('Недоступно', 'Для этой темы пока нет заданий в этой игре');
      return;
    }
    triggerHaptic('medium');
    useArcadeSessionStore.getState().startSession(session);
    router.push('/(modal)/arcade' as never);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.lg) }]}
      >
        <IconButton
          icon="arrow-back"
          onPress={() => router.back()}
          variant="onGradient"
          accessibilityLabel="Назад"
        />
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { fontSize: scaledFont('lg') }]} numberOfLines={1}>
            Аркада
          </Text>
          {branch && (
            <Text style={[styles.headerSubtitle, { fontSize: scaledFont('sm') }]} numberOfLines={1}>
              {branch.name}
            </Text>
          )}
        </View>
        <HelpButton screen="arcade_lobby" variant="onGradient" />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.lobbyContent} showsVerticalScrollIndicator={false}>
        {branchId === null ? (
          <View style={styles.lobbyEmpty}>
            <Text style={{ fontSize: scale(48) }}>🎮</Text>
            <Text style={[styles.lobbyEmptyTitle, { fontSize: scaledFont('lg') }]}>
              Аркада открывается в приключении
            </Text>
            <Text style={[styles.lobbyEmptyText, { fontSize: scaledFont('md') }]}>
              Начни приключение — и играй в мини-игры по его теме
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.lobbyInfo}>
              <Text style={{ fontSize: scale(22) }}>💡</Text>
              <Text style={[styles.lobbyInfoText, { fontSize: scaledFont('md') }]}>
                Игра стоит {ARCADE_ENERGY_COST}⚡, за каждый верный ответ — +
                {formatPrice(COINS_PER_CORRECT)}. Игра приближает финиш приключения до 15 минут
                (урок — на 45).
              </Text>
            </View>

            {games.map(({ type, roundLength }) => {
              const meta = ARCADE_GAME_META[type];
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => handlePlay(type)}
                  activeOpacity={0.85}
                  style={styles.lobbyGameCard}
                  accessibilityRole="button"
                  accessibilityLabel={`${meta.title}. ${meta.description}. ${meta.countLabel}: ${roundLength}`}
                >
                  <View
                    style={[styles.lobbyGameIcon, { backgroundColor: withAlpha(accent, 0.15) }]}
                  >
                    <Ionicons name={meta.icon} size={scale(28)} color={accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lobbyGameTitle, { fontSize: scaledFont('lg') }]}>
                      {meta.title}
                    </Text>
                    <Text style={[styles.lobbyGameText, { fontSize: scaledFont('sm') }]}>
                      {meta.description}
                    </Text>
                    <Text style={[styles.lobbyGameText, { fontSize: scaledFont('sm') }]}>
                      {meta.countLabel}: {roundLength}
                    </Text>
                  </View>
                  <Ionicons name="play-circle" size={scale(32)} color={accent} />
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}
