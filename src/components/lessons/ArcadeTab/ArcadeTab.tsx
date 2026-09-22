// src/components/lessons/ArcadeTab/ArcadeTab.tsx
// Вкладка «Аркада» — случайная тренировка по пройденной теме (§10 ТЗ)

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { ARCADE_ENERGY_COST } from '@/constants/gameplay';
import { getCompletedBranchIds, rollTrainerSession } from '@/lib/arcade/rollTrainerSession';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES } from '@/lib/hooks/useLessons';
import { useArcadeSessionStore } from '@/lib/stores/arcadeSessionStore';
import { usePreferences } from '@/lib/stores/preferencesStore';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontWeights, radius, spacing } from '@/theme/tokens';
import { BRANCH_ICONS, BRANCH_GRADIENTS } from '../branchVisuals';
import { createArcadeTabStyles } from './ArcadeTab.styles';

export function ArcadeTab() {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic, trigger } = useFeedback();
  const { isTrainerBranchExcluded, toggleExcludedTrainerBranch } = usePreferences();
  const router = useRouter();

  const styles = createArcadeTabStyles({ theme });
  const completedBranchIds = getCompletedBranchIds();
  const completedBranches = BRANCHES.filter((b) => completedBranchIds.includes(b.id));
  const availableBranches = completedBranches.filter((b) => !isTrainerBranchExcluded(b.id));

  if (completedBranches.length === 0) {
    return (
      <View style={styles.arcadeEmptyContainer}>
        <Text style={styles.arcadeEmptyEmoji}>🎮</Text>
        <Text style={styles.arcadeEmptyTitle}>Аркада пока пуста</Text>
        <Text style={styles.arcadeEmptyText}>
          Пройдите хотя бы одну тему полностью, чтобы разблокировать тренировки по ней
        </Text>
      </View>
    );
  }

  const handleStartTraining = () => {
    if (availableBranches.length === 0) {
      trigger('error');
      return;
    }

    const session = rollTrainerSession();
    if (!session) {
      trigger('error');
      return;
    }

    triggerHaptic('medium');
    useArcadeSessionStore.getState().startSession(session);
    router.push('/(modal)/arcade' as never);
  };

  return (
    <ScrollView
      style={styles.arcadeScroll}
      contentContainerStyle={styles.arcadeScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Подсказка про Аркаду */}
      <View style={styles.arcadeInfoBanner}>
        <Text style={{ fontSize: scale(22) }}>💡</Text>
        <Text style={[styles.arcadeInfoText, { fontSize: scaledFont('sm') }]}>
          Аркада стоит {ARCADE_ENERGY_COST}⚡ за игру и даёт +10⭐ за каждый верный ответ. Тема
          выбирается случайно среди пройденных.
        </Text>
      </View>

      {/* Кнопка запуска случайной тренировки */}
      <TouchableOpacity
        onPress={handleStartTraining}
        disabled={availableBranches.length === 0}
        activeOpacity={0.85}
        style={{
          borderRadius: scale(radius.lg),
          overflow: 'hidden',
          marginBottom: scale(spacing.xl),
          opacity: availableBranches.length === 0 ? 0.5 : 1,
        }}
      >
        <LinearGradient
          colors={theme.gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            padding: scale(spacing.xl),
            flexDirection: 'row',
            alignItems: 'center',
            gap: scale(spacing.md),
          }}
        >
          <Ionicons name="shuffle" size={scale(28)} color={theme.onGradient} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.onGradient,
                fontWeight: fontWeights.bold,
                fontSize: scaledFont('lg'),
              }}
            >
              Начать тренировку
            </Text>
            <Text style={{ color: withAlpha(theme.onGradient, 0.85), fontSize: scaledFont('sm') }}>
              {availableBranches.length > 0
                ? 'Случайная тема из пройденных'
                : 'Все темы исключены ниже'}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Список пройденных тем — можно исключить из случайного выбора */}
      <Text
        style={{
          color: theme.textSecondary,
          fontWeight: fontWeights.semibold,
          fontSize: scaledFont('sm'),
          marginBottom: scale(spacing.md),
        }}
      >
        Темы для тренировки
      </Text>
      <View style={styles.arcadeList}>
        {completedBranches.map((branch) => {
          const excluded = isTrainerBranchExcluded(branch.id);
          const gradient = BRANCH_GRADIENTS[branch.id] || theme.gradients.primary;

          return (
            <TouchableOpacity
              key={branch.id}
              onPress={() => {
                triggerHaptic('selection');
                toggleExcludedTrainerBranch(branch.id);
              }}
              activeOpacity={0.85}
              style={{
                borderRadius: scale(radius.lg),
                overflow: 'hidden',
                opacity: excluded ? 0.5 : 1,
              }}
            >
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: scale(spacing.lg), flexDirection: 'row', alignItems: 'center' }}
              >
                <View
                  style={{
                    width: scale(56),
                    height: scale(56),
                    borderRadius: scale(radius.lg),
                    backgroundColor: withAlpha(theme.onGradient, 0.2),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: scale(spacing.lg),
                  }}
                >
                  <Ionicons
                    name={BRANCH_ICONS[branch.id] || 'book'}
                    size={scale(28)}
                    color={theme.onGradient}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.onGradient,
                      fontWeight: fontWeights.bold,
                      fontSize: scaledFont('md'),
                      marginBottom: scale(spacing.xxs),
                    }}
                  >
                    {branch.name}
                  </Text>
                  <Text
                    style={{ color: withAlpha(theme.onGradient, 0.8), fontSize: scaledFont('sm') }}
                  >
                    {excluded ? 'Исключена из тренировки' : 'Участвует в случайном выборе'}
                  </Text>
                </View>

                <Ionicons
                  name={excluded ? 'close-circle' : 'checkmark-circle'}
                  size={scale(24)}
                  color={theme.onGradient}
                />
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
