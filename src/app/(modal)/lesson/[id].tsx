// src/app/(modal)/lesson/[id].tsx
// Экран урока: полная композиция шагов теория→награда→планирование→
// мини-игра→…→тест (§9.1, §9.6) для любого урока — все 19 уроков имеют
// theory_cards/test_questions (см. buildLessonSteps).
//
// Шапка (закрыть/прогресс/настроение) — внутри StepRunner (LessonStepHeader),
// этот файл отвечает только за загрузку урока и модалку паузы.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Modal, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { StepRunner } from '@/components/lesson';
import { buildLessonSteps } from '@/domain/lesson/buildLessonSteps';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { FIVE_LETTERS_WORDS, LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatPrice } from '@/lib/utils/formatters';
import { useTheme } from '@/theme';
import { createLessonStyles } from '../../../styles/screens/lesson/_[id].styles';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id, 10);
  const router = useRouter();

  const { theme } = useTheme();
  const { trigger, triggerHaptic } = useFeedback();
  // Только экшен (стабильная ссылка) — экран не должен перерисовываться
  // при изменениях прогресса других уроков.
  const startLesson = useLessonsStore((s) => s.startLesson);

  const styles = createLessonStyles({ theme });

  const [stepRunnerComplete, setStepRunnerComplete] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // LESSONS — статический забандленный массив, поиск чистый и синхронный —
  // не требует useState+useEffect (не даёт лишнего рендера и не вызывает
  // set-state внутри эффекта).
  const lesson = useMemo(() => LESSONS.find((l) => l.id === lessonId) ?? null, [lessonId]);

  // §18 демо-режим — укороченный урок (DEMO_LESSON_LIMITS).
  const isDemo = useUserStore((s) => s.user?.is_demo ?? false);
  const steps = useMemo(
    () => (lesson ? buildLessonSteps(lesson, FIVE_LETTERS_WORDS, isDemo) : null),
    [lesson, isDemo]
  );
  const isFinished = stepRunnerComplete;

  // Инициализация прогресса урока (side effect, не производит setState в этом компоненте)
  useEffect(() => {
    if (!lesson) {
      trigger('error');
      Alert.alert('Ошибка', 'Урок не найден');
      router.back();
      return;
    }
    try {
      startLesson(lessonId);
    } catch (error) {
      console.error('[Lesson] Ошибка инициализации прогресса урока:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, lesson]);

  // §9.1/§21: попытка выйти до завершения — предупреждаем, что прогресс не сохранится
  const handleBackPress = () => {
    if (isFinished) {
      router.back();
    } else {
      triggerHaptic('light');
      setShowPauseModal(true);
    }
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFinished) return false;
      setShowPauseModal(true);
      return true;
    });
    return () => subscription.remove();
  }, [isFinished]);

  // Экран загрузки
  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка урока...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Контент (шапка — внутри StepRunner) */}
      {steps && (
        <StepRunner
          lesson={lesson}
          steps={steps}
          onExit={() => router.back()}
          onRequestExit={handleBackPress}
          onComplete={() => setStepRunnerComplete(true)}
        />
      )}

      {/* Модалка паузы (референс «Пауза урока») */}
      <Modal
        visible={showPauseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPauseModal(false)}
      >
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <View style={styles.pauseBadge}>
              <Text style={styles.pauseBadgeText}>ПАУЗА УРОКА</Text>
            </View>
            <Text style={styles.pauseTitle}>Уже уходишь?</Text>
            <Text style={styles.pauseSubtitle}>
              Прогресс текущего урока не сохранится, и ты не получишь монеты.
            </Text>
            <View style={styles.pauseWarningBanner}>
              <Text style={styles.pauseWarningText}>{formatPrice(0)}</Text>
              <Text style={styles.pauseWarningText}>⚡ Прогресс будет сброшен</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowPauseModal(false)}
              activeOpacity={0.8}
              style={styles.pauseContinueButton}
            >
              <Text style={styles.pauseContinueText}>Продолжить урок</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowPauseModal(false);
                router.back();
              }}
              activeOpacity={0.7}
              style={styles.pauseExitButton}
            >
              <Text style={styles.pauseExitText}>Выйти из урока</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
