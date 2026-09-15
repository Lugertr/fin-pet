// src/app/(tabs)/lessons.tsx
// Экран уроков: древо компетенций (стиль Duolingo) + Аркада

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES, LESSONS, Lesson, useLessonsStore } from '@/lib/hooks/useLessons';
import { useGifts } from '@/lib/stores/giftsStore';
import { usePreferences } from '@/lib/stores/preferencesStore';
import { useResponsive, useTheme } from '@/theme';
import { fontWeights, spacing } from '@/theme/tokens';
import type { IconName } from '@/types/icons';
import { createLessonsStyles } from '../../styles/screens/tabs/_lessons.styles';

// Иконки для веток
const BRANCH_ICONS: Record<number, IconName> = {
  1: 'wallet',
  2: 'shield-checkmark',
  3: 'trending-up',
  4: 'document-text',
  5: 'card',
  6: 'business',
  7: 'earth',
};

// Градиенты для веток
const BRANCH_GRADIENTS: Record<number, [string, string]> = {
  1: ['#10B981', '#06B6D4'],
  2: ['#06B6D4', '#10B981'],
  3: ['#F59E0B', '#F97316'],
  4: ['#EF4444', '#F97316'],
  5: ['#38BDF8', '#6366F1'],
  6: ['#A855F7', '#EC4899'],
  7: ['#10B981', '#06B6D4'],
};

// Режимы отображения
type TabMode = 'tree' | 'arcade';

export default function LessonsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { getBranchProgress, progress, isLessonAvailable } = useLessonsStore();
  const { isPriorityBranch } = usePreferences();
  const { triggerHaptic } = useFeedback();

  const styles = createLessonsStyles({ theme });

  const [selectedBranchId, setSelectedBranchId] = useState<number>(BRANCHES[0].id);
  const [tabMode, setTabMode] = useState<TabMode>('tree');

  const headerGradient: [string, string] = isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F1F5F9'];

  const handleSelectBranch = (branchId: number) => {
    triggerHaptic('selection');
    setSelectedBranchId(branchId);
  };

  const selectedBranch = BRANCHES.find((b) => b.id === selectedBranchId);
  const branchProgress = getBranchProgress(selectedBranchId);
  const lessonsInBranch = LESSONS.filter((l) => l.branch_id === selectedBranchId).sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <View style={styles.container}>
      {/* Заголовок с переключателем режима */}
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.lg) }]}
      >
        <Text
          style={[styles.title, { fontSize: scaledFont('title'), marginBottom: scale(spacing.lg) }]}
        >
          Уроки 📚
        </Text>

        {/* Переключатель: Дерево / Аркада */}
        <View style={styles.tabSwitcher}>
          <TabButton
            active={tabMode === 'tree'}
            icon="school"
            label="Обучение"
            onPress={() => {
              triggerHaptic('selection');
              setTabMode('tree');
            }}
          />
          <TabButton
            active={tabMode === 'arcade'}
            icon="game-controller"
            label="Аркада"
            onPress={() => {
              triggerHaptic('selection');
              setTabMode('arcade');
            }}
          />
        </View>
      </LinearGradient>

      {/* Режим: Древо уроков */}
      {tabMode === 'tree' && (
        <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1 }}>
          {/* Горизонтальный скролл веток с ФИКСИРОВАННОЙ высотой */}
          <View style={[styles.branchesContainer, { height: scale(72) }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.branchesScroll, styles.branchesRow]}
              style={{ flex: 1 }}
            >
              {BRANCHES.map((branch) => {
                const branchProg = getBranchProgress(branch.id);
                const isSelected = branch.id === selectedBranchId;
                const gradient = BRANCH_GRADIENTS[branch.id] || ['#10B981', '#06B6D4'];
                const isPriority = isPriorityBranch(branch.id);

                return (
                  <TouchableOpacity
                    key={branch.id}
                    onPress={() => handleSelectBranch(branch.id)}
                    activeOpacity={0.8}
                    style={[isSelected ? styles.branchCardSelected : undefined, { height: '100%' }]}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.branchCardSelectedInner, { minWidth: scale(110) }]}
                      >
                        <View style={styles.branchCardSelectedTopRow}>
                          <Ionicons
                            name={BRANCH_ICONS[branch.id] || 'book'}
                            size={scale(14)}
                            color="#FFFFFF"
                          />
                          <Text
                            style={[styles.branchNameSelected, { fontSize: scaledFont('sm') }]}
                            numberOfLines={1}
                          >
                            {branch.name}
                          </Text>
                          {isPriority && (
                            <View style={[styles.priorityBadge, styles.priorityBadgeSelected]}>
                              <Text
                                style={[
                                  styles.priorityBadgeTextSelected,
                                  { fontSize: scaledFont('xxs') },
                                ]}
                              >
                                +10%
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.branchProgressText, { fontSize: scaledFont('xxs') }]}>
                          {branchProg.completed}/{branchProg.total}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.branchCardUnselected, { minWidth: scale(110) }]}>
                        <View style={styles.branchCardUnselectedTopRow}>
                          <Ionicons
                            name={BRANCH_ICONS[branch.id] || 'book'}
                            size={scale(14)}
                            color={theme.textSecondary}
                          />
                          <Text
                            style={[styles.branchNameUnselected, { fontSize: scaledFont('sm') }]}
                            numberOfLines={1}
                          >
                            {branch.name}
                          </Text>
                          {isPriority && (
                            <View style={[styles.priorityBadge, styles.priorityBadgeUnselected]}>
                              <Text
                                style={[
                                  styles.priorityBadgeTextUnselected,
                                  { fontSize: scaledFont('xxs') },
                                ]}
                              >
                                +10%
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.branchProgressTextUnselected,
                            { fontSize: scaledFont('xxs') },
                          ]}
                        >
                          {branchProg.completed}/{branchProg.total}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Прогресс-бар ветки */}
          <View style={[styles.branchProgressSection, { marginBottom: scale(spacing.md) }]}>
            <View style={styles.branchProgressHeader}>
              <View style={styles.branchProgressLabelRow}>
                <Text style={[styles.branchProgressLabel, { fontSize: scaledFont('sm') }]}>
                  Прогресс: {branchProgress.completed} из {branchProgress.total}
                </Text>
                {isPriorityBranch(selectedBranchId) && (
                  <View style={styles.recommendedBadge}>
                    <Ionicons name="sparkles" size={scale(10)} color={theme.success} />
                    <Text style={[styles.recommendedText, { fontSize: scaledFont('xxs') }]}>
                      РЕКОМЕНДОВАНО
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.branchProgressPercent, { fontSize: scaledFont('sm') }]}>
                {branchProgress.total > 0
                  ? Math.round((branchProgress.completed / branchProgress.total) * 100)
                  : 0}
                %
              </Text>
            </View>
            <View style={styles.branchProgressBar}>
              <LinearGradient
                colors={BRANCH_GRADIENTS[selectedBranchId] || ['#10B981', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: '100%',
                  width: `${
                    branchProgress.total > 0
                      ? (branchProgress.completed / branchProgress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </View>
          </View>

          {/* Вертикальный путь уроков (стиль Duolingo) */}
          <ScrollView
            style={styles.lessonsScroll}
            contentContainerStyle={styles.lessonsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {lessonsInBranch.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>В этой теме пока нет уроков</Text>
                <Text style={styles.emptyText}>Новые уроки скоро появятся!</Text>
              </View>
            ) : (
              lessonsInBranch.map((lesson, index) => {
                const lessonProgress = progress[lesson.id];
                const isCompleted = lessonProgress?.status === 'completed';
                const isAvailable = isLessonAvailable(lesson.id);
                const isCurrent = isAvailable && !isCompleted;

                return (
                  <LessonNode
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    totalLessons={lessonsInBranch.length}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isAvailable={isAvailable}
                    branchColor={BRANCH_GRADIENTS[selectedBranchId]?.[0] || '#10B981'}
                    isPriority={isPriorityBranch(selectedBranchId)}
                    onPress={() => {
                      if (isAvailable) {
                        triggerHaptic('medium');
                        router.push(`/(modal)/lesson/${lesson.id}` as never);
                      }
                    }}
                  />
                );
              })
            )}

            {/* Награда за завершение темы */}
            {branchProgress.completed === branchProgress.total && branchProgress.total > 0 && (
              <ThemeCompleteReward
                branchId={selectedBranchId}
                branchName={selectedBranch?.name || ''}
              />
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Режим: Аркада */}
      {tabMode === 'arcade' && (
        <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1 }}>
          <ArcadeTab />
        </Animated.View>
      )}
    </View>
  );
}

/**
 * Кнопка переключения табов
 */
function TabButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: scale(spacing.xs),
          paddingVertical: scale(spacing.sm),
          borderRadius: scale(spacing.sm),
          backgroundColor: active ? theme.primary : 'transparent',
        },
      ]}
    >
      <Ionicons name={icon} size={scale(16)} color={active ? '#FFFFFF' : theme.textSecondary} />
      <Text
        style={{
          color: active ? '#FFFFFF' : theme.textSecondary,
          fontWeight: fontWeights.semibold,
          fontSize: scaledFont('md'),
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Узел урока в вертикальном пути (стиль Duolingo)
 */
function LessonNode({
  lesson,
  index,
  totalLessons,
  isCompleted,
  isCurrent,
  isAvailable,
  branchColor,
  isPriority,
  onPress,
}: {
  lesson: Lesson;
  index: number;
  totalLessons: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isAvailable: boolean;
  branchColor: string;
  isPriority: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  // Чередование смещения для "зигзага"
  const offset = index % 2 === 0 ? -30 : 30;

  return (
    <View
      style={{
        alignItems: 'center',
        marginBottom: index === totalLessons - 1 ? 0 : scale(spacing.sm),
      }}
    >
      {/* Соединительная линия сверху */}
      {index > 0 && (
        <View
          style={{
            width: scale(3),
            height: scale(16),
            backgroundColor: isCompleted || isCurrent ? branchColor : theme.surfaceLight,
            marginTop: scale(-4),
          }}
        />
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        {/* Отступ слева для зигзага */}
        <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: scale(spacing.sm) }}>
          {offset < 0 && (
            <LessonInfo
              lesson={lesson}
              isCompleted={isCompleted}
              isPriority={isPriority}
              align="right"
            />
          )}
        </View>

        {/* Кружок урока */}
        <TouchableOpacity
          onPress={onPress}
          disabled={!isAvailable}
          activeOpacity={0.8}
          style={{
            width: scale(60),
            height: scale(60),
            borderRadius: scale(30),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isCompleted ? branchColor : isCurrent ? '#FFFFFF' : theme.surfaceLight,
            borderWidth: isCurrent ? scale(3) : 0,
            borderColor: isCurrent ? branchColor : 'transparent',
            opacity: isAvailable ? 1 : 0.5,
            shadowColor: isCurrent ? branchColor : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isCurrent ? 0.4 : 0,
            shadowRadius: 8,
            elevation: isCurrent ? 8 : 0,
          }}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={scale(28)} color="#FFFFFF" />
          ) : isCurrent ? (
            <Ionicons name="play" size={scale(22)} color={branchColor} />
          ) : (
            <Ionicons name="lock-closed" size={scale(20)} color={theme.textMuted} />
          )}
        </TouchableOpacity>

        {/* Отступ справа для зигзага */}
        <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: scale(spacing.sm) }}>
          {offset > 0 && (
            <LessonInfo
              lesson={lesson}
              isCompleted={isCompleted}
              isPriority={isPriority}
              align="left"
            />
          )}
        </View>
      </View>

      {/* Соединительная линия снизу */}
      {index < totalLessons - 1 && (
        <View
          style={{
            width: scale(3),
            height: scale(16),
            backgroundColor: isCompleted ? branchColor : theme.surfaceLight,
            marginBottom: scale(-4),
          }}
        />
      )}
    </View>
  );
}

/**
 * Информация об уроке рядом с кружком
 */
function LessonInfo({
  lesson,
  isCompleted,
  isPriority,
  align,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  isPriority: boolean;
  align: 'left' | 'right';
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();

  return (
    <View style={{ maxWidth: 130 }}>
      <Text
        style={{
          color: theme.textPrimary,
          fontWeight: fontWeights.semibold,
          fontSize: scaledFont('sm'),
          textAlign: align,
        }}
        numberOfLines={2}
      >
        {lesson.title}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginTop: 2,
          justifyContent: align === 'left' ? 'flex-start' : 'flex-end',
        }}
      >
        <Text
          style={{
            color: isCompleted ? theme.success : theme.textMuted,
            fontSize: scaledFont('xxs'),
            textTransform: 'uppercase',
            fontWeight: fontWeights.semibold,
          }}
        >
          {isCompleted ? '✓ Пройдено' : lesson.minigame_type === 'quiz' ? 'Викторина' : 'Мини-игра'}
        </Text>
        {isPriority && !isCompleted && (
          <Text
            style={{
              color: theme.success,
              fontSize: scaledFont('xxs'),
              fontWeight: fontWeights.bold,
            }}
          >
            +10%
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Награда за завершение всей темы (интеграция с подарками)
 */
function ThemeCompleteReward({ branchId, branchName }: { branchId: number; branchName: string }) {
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const router = useRouter();
  const { hasUnopenedGiftForBranch, addGiftForTheme, pendingGifts } = useGifts();

  const hasGift = hasUnopenedGiftForBranch(branchId);
  const branchGift = pendingGifts.find((g) => g.branchId === branchId && !g.isOpened);

  const handleGetGift = () => {
    triggerHaptic('success');
    const giftToOpen = branchGift || addGiftForTheme(branchId, branchName);
    router.push({
      pathname: '/(modal)/theme-reward',
      params: { giftId: giftToOpen.id },
    } as never);
  };

  return (
    <Animated.View entering={FadeInDown.delay(300)} style={{ marginTop: scale(spacing.xxxl) }}>
      <TouchableOpacity
        onPress={handleGetGift}
        activeOpacity={0.8}
        style={{ borderRadius: scale(spacing.xl), overflow: 'hidden' }}
      >
        <LinearGradient
          colors={['#F59E0B', '#EF4444', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: scale(spacing.xxl), alignItems: 'center' }}
        >
          <View
            style={{
              width: scale(80),
              height: scale(80),
              borderRadius: scale(40),
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: scale(spacing.lg),
            }}
          >
            <Text style={{ fontSize: scale(40) }}>🎁</Text>
          </View>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: scaledFont('xxl'),
              fontWeight: fontWeights.bold,
              textAlign: 'center',
              marginBottom: scale(spacing.xs),
            }}
          >
            Поздравляем!
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: scaledFont('md'),
              textAlign: 'center',
              marginBottom: scale(spacing.lg),
            }}
          >
            Вы прошли всю тему «{branchName}»!
          </Text>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              paddingHorizontal: scale(spacing.xl),
              paddingVertical: scale(spacing.sm),
              borderRadius: scale(spacing.xl),
            }}
          >
            <Text
              style={{ color: '#FFFFFF', fontWeight: fontWeights.bold, fontSize: scaledFont('md') }}
            >
              {hasGift ? 'Открыть подарок 🎁' : 'Получить подарок 🎁'}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Вкладка "Аркада" — повторение пройденных мини-игр
 */
function ArcadeTab() {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { progress } = useLessonsStore();
  const { triggerHaptic } = useFeedback();
  const router = useRouter();

  const styles = createLessonsStyles({ theme });
  const completedLessons = LESSONS.filter((l) => progress[l.id]?.status === 'completed');

  if (completedLessons.length === 0) {
    return (
      <View style={styles.arcadeEmptyContainer}>
        <Text style={styles.arcadeEmptyEmoji}>🎮</Text>
        <Text style={styles.arcadeEmptyTitle}>Аркада пока пуста</Text>
        <Text style={styles.arcadeEmptyText}>
          Пройдите хотя бы один урок, чтобы разблокировать мини-игры для повторения
        </Text>
      </View>
    );
  }

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
          В Аркаде можно играть без трат настроения и получать монеты!
        </Text>
      </View>

      {/* Список доступных игр */}
      <View style={styles.arcadeList}>
        {completedLessons.map((lesson) => {
          const branch = BRANCHES.find((b) => b.id === lesson.branch_id);
          const gradient = BRANCH_GRADIENTS[lesson.branch_id] || ['#10B981', '#06B6D4'];

          return (
            <TouchableOpacity
              key={lesson.id}
              onPress={() => {
                triggerHaptic('medium');
                router.push(`/(modal)/arcade/${lesson.id}` as never);
              }}
              activeOpacity={0.85}
              style={{ borderRadius: scale(spacing.lg), overflow: 'hidden' }}
            >
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: scale(spacing.lg), flexDirection: 'row', alignItems: 'center' }}
              >
                {/* Иконка игры */}
                <View
                  style={{
                    width: scale(56),
                    height: scale(56),
                    borderRadius: scale(spacing.lg),
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: scale(spacing.lg),
                  }}
                >
                  <Ionicons
                    name={lesson.minigame_type === 'quiz' ? 'help-circle' : 'swap-horizontal'}
                    size={scale(28)}
                    color="#FFFFFF"
                  />
                </View>

                {/* Информация */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontWeight: fontWeights.bold,
                      fontSize: scaledFont('md'),
                      marginBottom: scale(spacing.xxs),
                    }}
                  >
                    {lesson.title}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: scaledFont('sm') }}>
                    {branch?.name} • {lesson.minigame_type === 'quiz' ? 'Викторина' : 'Мини-игра'}
                  </Text>
                </View>

                {/* Кнопка играть */}
                <View
                  style={{
                    width: scale(32),
                    height: scale(32),
                    borderRadius: scale(16),
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="play" size={scale(14)} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
