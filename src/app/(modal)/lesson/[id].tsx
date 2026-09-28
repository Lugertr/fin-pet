// src/app/(modal)/lesson/[id].tsx
// Экран урока: LessonPlayer — урок из узлов (ситуация → этапы → заключение),
// уроки старого формата — через адаптер (domain/lesson/LessonPlan.ts).
//
// Шапка (закрыть/прогресс/настроение) — внутри LessonPlayer (LessonStepHeader),
// этот файл отвечает только за загрузку урока и модалку паузы. Пройденные
// этапы урока сохраняются сразу, поэтому выход не теряет прогресс — начнётся
// заново только незаконченное задание.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Modal, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { LessonPlayer } from '@/components/lesson';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { Alert } from '@/lib/utils/alert';
import { useTheme } from '@/theme';
import { createLessonStyles } from '../../../styles/screens/lesson/_[id].styles';

export default function LessonScreen() {
  // node — открыт с трека смены пройденный этап (перечитать / перепройти).
  const { id, node } = useLocalSearchParams<{ id: string; node?: string }>();
  const lessonId = parseInt(id, 10);
  const focusNode = node !== undefined ? parseInt(node, 10) : undefined;
  const router = useRouter();

  const { theme } = useTheme();
  const { trigger, triggerHaptic } = useFeedback();
  // Только экшен (стабильная ссылка) — экран не должен перерисовываться
  // при изменениях прогресса других уроков.
  const startLesson = useLessonsStore((s) => s.startLesson);

  const styles = createLessonStyles({ theme });

  // Выход посреди задания — через подтверждение (решает LessonPlayer).
  const [needsExitConfirm, setNeedsExitConfirm] = useState(true);
  const [showPauseModal, setShowPauseModal] = useState(false);

  const lesson = useMemo(() => LESSONS.find((l) => l.id === lessonId) ?? null, [lessonId]);

  // Строка прогресса урока — при первом открытии (урок «начат»).
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

  const handleBackPress = () => {
    if (!needsExitConfirm) {
      router.back();
    } else {
      triggerHaptic('light');
      setShowPauseModal(true);
    }
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!needsExitConfirm) return false;
      setShowPauseModal(true);
      return true;
    });
    return () => subscription.remove();
  }, [needsExitConfirm]);

  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка урока...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LessonPlayer
        lesson={lesson}
        focusNode={Number.isNaN(focusNode) ? undefined : focusNode}
        onExit={() => router.back()}
        onRequestExit={handleBackPress}
        onExitGuardChange={setNeedsExitConfirm}
      />

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
              Пройденные этапы сохранятся — в следующий раз продолжишь с того же места. Начатое
              задание придётся пройти заново.
            </Text>
            <View style={styles.pauseWarningBanner}>
              <Text style={styles.pauseWarningText}>✓ Прогресс урока сохранён</Text>
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
