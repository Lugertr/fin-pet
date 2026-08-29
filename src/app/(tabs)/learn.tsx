// app/(tabs)/learn.tsx
// Экран обучения: 7 веток компетенций с уроками (улучшенный визуал)

import { COLORS } from '@/constants/theme';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { Branch, BRANCHES, Lesson, LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import type { IconName } from '@/types/icons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
  1: ['#6366F1', '#8B5CF6'],
  2: ['#22C55E', '#14B8A6'],
  3: ['#F59E0B', '#F97316'],
  4: ['#EF4444', '#F97316'],
  5: ['#38BDF8', '#6366F1'],
  6: ['#A855F7', '#EC4899'],
  7: ['#14B8A6', '#22C55E'],
};

export default function LearnScreen() {
  const { getBranchProgress } = useLessonsStore();
  const { triggerHaptic } = useFeedback();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const handleSelectBranch = (branchId: number) => {
    triggerHaptic('light');
    setSelectedBranchId(branchId);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Заголовок */}
      <LinearGradient
        colors={['#1E293B', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24 }}
      >
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
          Обучение 📚
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
          Выберите направление для изучения финансовой грамотности
        </Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Сетка веток */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 }}>
          {BRANCHES.map((branch) => {
            const branchProgress = getBranchProgress(branch.id);
            return (
              <BranchCard
                key={branch.id}
                branch={branch}
                progress={branchProgress}
                onPress={() => handleSelectBranch(branch.id)}
              />
            );
          })}
        </View>

        {/* Выбранная ветка: список уроков */}
        {selectedBranchId && (
          <BranchLessons branchId={selectedBranchId} onClose={() => setSelectedBranchId(null)} />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

/**
 * Карточка ветки компетенций
 */
function BranchCard({
  branch,
  progress,
  onPress,
}: {
  branch: Branch;
  progress: { completed: number; total: number };
  onPress: () => void;
}) {
  const icon = BRANCH_ICONS[branch.id] || 'book';
  const gradient = BRANCH_GRADIENTS[branch.id] || ['#6366F1', '#8B5CF6'];
  const isCompleted = progress.completed === progress.total && progress.total > 0;
  const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ width: '48%', borderRadius: 20, overflow: 'hidden' }}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 16, borderRadius: 20 }}
      >
        {/* Иконка */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Ionicons name={icon} size={24} color="white" />
        </View>

        {/* Название */}
        <Text
          style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}
          numberOfLines={2}
        >
          {branch.name}
        </Text>

        {/* Описание */}
        {branch.description && (
          <Text
            style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 12 }}
            numberOfLines={2}
          >
            {branch.description}
          </Text>
        )}

        {/* Прогресс */}
        <View style={{ marginTop: 'auto' }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' }}>
              {progress.completed}/{progress.total} уроков
            </Text>
            {isCompleted && (
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>✓ Готово</Text>
              </View>
            )}
          </View>
          {/* Прогресс-бар */}
          <View
            style={{
              height: 6,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/**
 * Список уроков в выбранной ветке
 */
function BranchLessons({ branchId, onClose }: { branchId: number; onClose: () => void }) {
  const { isLessonAvailable } = useLessonsStore();
  const { triggerHaptic } = useFeedback();

  const lessonsInBranch = LESSONS.filter((l) => l.branch_id === branchId).sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
      {/* Заголовок секции */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Уроки</Text>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            onClose();
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.surfaceLight,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Список уроков */}
      {lessonsInBranch.map((lesson, index) => {
        const { progress } = useLessonsStore.getState();
        const lessonProgress = progress[lesson.id];
        const isCompleted = lessonProgress?.status === 'completed';
        const isAvailable = isLessonAvailable(lesson.id);

        return (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={index}
            isCompleted={isCompleted}
            isAvailable={isAvailable}
          />
        );
      })}
    </View>
  );
}

/**
 * Карточка урока
 */
function LessonCard({
  lesson,
  index,
  isCompleted,
  isAvailable,
}: {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  isAvailable: boolean;
}) {
  const router = useRouter();
  const { triggerHaptic } = useFeedback();

  const getStatusIcon = () => {
    if (isCompleted) return { name: 'checkmark-circle' as IconName, color: COLORS.success };
    if (isAvailable) return { name: 'play-circle' as IconName, color: COLORS.primary };
    return { name: 'lock-closed' as IconName, color: COLORS.textMuted };
  };

  const status = getStatusIcon();

  return (
    <TouchableOpacity
      onPress={() => {
        if (isAvailable) {
          triggerHaptic('light');
          router.push(`/(modal)/lesson/${lesson.id}` as never);
        }
      }}
      disabled={!isAvailable}
      activeOpacity={0.8}
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        opacity: isAvailable ? 1 : 0.5,
        borderWidth: 1,
        borderColor: isCompleted ? COLORS.success : COLORS.surfaceLight,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Номер урока */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: isCompleted ? `${COLORS.success}20` : `${COLORS.primary}20`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={20} color={COLORS.success} />
          ) : (
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{index + 1}</Text>
          )}
        </View>

        {/* Информация */}
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: 'white', fontWeight: '600', fontSize: 15, marginBottom: 4 }}
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons
              name={lesson.minigame_type === 'quiz' ? 'help-circle' : 'game-controller'}
              size={12}
              color={COLORS.textMuted}
            />
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
              {lesson.minigame_type === 'quiz' ? 'Викторина' : 'Мини-игра'}
            </Text>
          </View>
        </View>

        {/* Статус */}
        <Ionicons name={status.name} size={24} color={status.color} />
      </View>
    </TouchableOpacity>
  );
}
