// src/components/adventure/AdventureActiveView/AdventureActiveView.tsx
// Экран смены «Работа» (макет, 28.09.2026) — отдельный экран
// (app/(modal)/adventure.tsx), открывается с хаба. Смена = один урок:
// сверху — сцена «питомец работает» (work.svg вида и скина), плашка
// «Работа: 2 из 5» и трек этапов урока; дальше — карточка текущего шага и
// «Начать задание» (урок продолжается с того же места), под ними — «Бюджет
// работы» (тап — окно «План»). Пройденный этап на треке открывает его, чтобы
// перечитать и перепройти. В шапке: «назад» на хаб, «?» и ✕ — закончить
// смену раньше. Итоги здесь не показываются: смена завершилась (урок пройден,
// ✕ или 24 часа вышли) — экран сам возвращается на хаб, там итоги.

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useIsFocused, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { AppHeaderStats, useAppHeaderPadding } from '@/components/shared';
import { IconButton } from '@/components/ui';
import {
  AdventureRecord,
  computeAdventurePayout,
  planSpendRemaining,
} from '@/domain/adventure/Adventure';
import { LessonPlan, planForLesson } from '@/domain/lesson/LessonPlan';
import {
  LessonPosition,
  completedNodeCount,
  createLessonProgress,
  currentPosition,
  isNodeComplete,
  totalNodeCount,
} from '@/domain/lesson/lessonProgress';
import { getPetSpecies } from '@/domain/pet/petSpeciesRegistry';
import { formatDuration } from '@/lib/adventure/formatDuration';
import { useAdventureCountdown } from '@/lib/adventure/useAdventureCountdown';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { LESSONS, Lesson, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatPrice, pluralize } from '@/lib/utils/formatters';
import { colorPalettes } from '@/theme/tokens';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import type { IconName } from '@/types/icons';
import { AdventureAmountCard } from '../AdventureAmountCard';
import { AdventureNodeTrack, NODE_KIND_ICONS } from '../AdventureNodeTrack';
import { AdventurePlanFactCard } from '../AdventurePlanFactCard';
import { ShiftBudgetCard } from '../ShiftBudgetCard';
import { createAdventureActiveViewStyles } from './AdventureActiveView.styles';

// Сцена ограничена по ширине — на широких экранах/планшетах картинка иначе
// разрасталась и перекрывала остальной контент.
const SCENE_MAX_WIDTH = 520;
// Соотношение сторон work.svg (297×275) — одинаковое у всех видов и скинов.
const SCENE_ASPECT_RATIO = 297 / 275;
const SCENE_HORIZONTAL_PADDING = 16;

const MINIGAME_NAMES: Record<string, string> = {
  quiz: 'Викторина',
  tinder_swipe: 'Свайпы',
  five_letters: '5 букв',
};

/** Урок смены: зафиксированный при старте; у смены старой модели — следующий урок темы. */
function shiftLesson(adventure: AdventureRecord, nextInBranch: Lesson | null): Lesson | null {
  if (adventure.lessonId !== null) return LESSONS.find((l) => l.id === adventure.lessonId) ?? null;
  return nextInBranch;
}

/** Карточка текущего шага: что делать дальше. */
function describeStep(
  position: LessonPosition,
  plan: LessonPlan
): { icon: IconName; color: string; title: string; subtitle: string } {
  if (position.kind === 'reading') {
    return {
      icon: 'book-outline',
      color: colorPalettes.indigo[500],
      title: position.node.situation ? 'Ситуация и теория' : 'Теория',
      subtitle: 'прочитай — дальше будет задание',
    };
  }
  if (position.kind === 'activity') {
    const { content } = position.activity;
    if (content.type === 'event') {
      return {
        icon: NODE_KIND_ICONS.event,
        color: colorPalettes.amber[500],
        title: 'Событие',
        subtitle: 'твоё решение повлияет на бюджет работы',
      };
    }
    if (content.type === 'minigame') {
      return {
        icon: NODE_KIND_ICONS.minigame,
        color: colorPalettes.violet[500],
        title: `Мини-игра «${MINIGAME_NAMES[content.minigame_type] ?? 'Игра'}»`,
        subtitle: 'пройдёшь — продвинешь работу',
      };
    }
    const count = content.questions.length;
    return {
      icon: NODE_KIND_ICONS.test,
      color: colorPalettes.indigo[500],
      title: `Тест · ${count} ${pluralize(count, 'вопрос', 'вопроса', 'вопросов')}`,
      subtitle: 'пройдёшь — продвинешь работу',
    };
  }
  return {
    icon: 'flag',
    color: colorPalettes.emerald[500],
    title: position.kind === 'final' ? 'Завершение урока' : 'Урок пройден',
    subtitle:
      position.kind === 'final'
        ? `итог урока «${plan.title}» и награда`
        : 'заверши смену — итоги ждут на хабе',
  };
}

export function AdventureActiveView() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont, width: screenWidth } = useResponsive();
  const headerPadding = useAppHeaderPadding();
  const { triggerHaptic } = useFeedback();
  const completeAdventure = useAdventureStore((s) => s.completeAdventure);
  const completeIfExpired = useAdventureStore((s) => s.completeIfExpired);
  const getNextLessonInBranch = useLessonsStore((s) => s.getNextLessonInBranch);
  const lessonStates = useLessonsStore((s) => s.lessonStates);
  const petType = usePreferencesStore((s) => s.petType);
  const currentMood = usePetStore((s) => s.currentMood);
  const equippedSkinVariant = usePetStore((s) => s.equippedSkinVariant);
  const coins = useUserStore((s) => s.user?.liquid_balance ?? 0);
  const isDemo = useUserStore((s) => s.user?.is_demo ?? false);

  const styles = createAdventureActiveViewStyles({ theme });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const countdown = useAdventureCountdown();
  // Экран остаётся смонтированным под уроком — без проверки фокуса он бы
  // уводил на хаб или завершал смену посреди урока.
  const isFocused = useIsFocused();

  const adventure = countdown.active ? countdown.adventure : null;
  const lesson = useMemo(
    () =>
      adventure && adventure.branchId !== null
        ? shiftLesson(adventure, getNextLessonInBranch(adventure.branchId))
        : null,
    [adventure, getNextLessonInBranch]
  );
  const plan = useMemo(() => (lesson ? planForLesson(lesson, isDemo) : null), [lesson, isDemo]);
  const progress = lesson ? (lessonStates[lesson.id] ?? createLessonProgress(lesson.id)) : null;

  // 24 часа вышли, пока открыт этот экран, — завершаем сразу (итоги — на хабе).
  const isExpiredNow = countdown.active && countdown.expired;
  useEffect(() => {
    if (isFocused && isExpiredNow) void completeIfExpired();
  }, [isFocused, isExpiredNow, completeIfExpired]);

  // Смена завершена (урок пройден, ✕ или время вышло) — назад на хаб, там итоги.
  useEffect(() => {
    if (!isFocused || countdown.active) return;
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)' as never);
  }, [isFocused, countdown.active, router]);

  if (!countdown.active || !adventure) return null;

  const openLesson = (node?: number) => {
    if (!lesson) return;
    triggerHaptic('light');
    router.push(
      `/(modal)/lesson/${lesson.id}${node !== undefined ? `?node=${node}` : ''}` as never
    );
  };

  const position = plan && progress ? currentPosition(plan, progress) : null;
  const done = plan && progress ? completedNodeCount(plan, progress) : 0;
  const total = plan ? totalNodeCount(plan) : 0;
  const lessonDone = position?.kind === 'done';

  const performComplete = async () => {
    triggerHaptic('medium');
    const result = await completeAdventure();
    // null при уже пустом сторе — смена в этот момент завершилась сама, это не ошибка.
    if (!result && useAdventureStore.getState().currentAdventure) {
      Alert.alert('Не получилось', 'Не удалось закончить смену, попробуй ещё раз');
    }
  };

  // ✕ — закончить смену раньше. Всегда через подтверждение: крестик легко
  // задеть, а завершение необратимо. Это не провал (§8): урок сохранится и
  // продолжится в следующую смену, а бюджет выплатится по пройденной доле.
  const handleCompletePress = () => {
    triggerHaptic('light');
    if (lessonDone || isDemo || total === 0) {
      Alert.alert('Закончить смену?', 'Итоги появятся на хабе.', [
        { text: 'Продолжать', style: 'cancel' },
        { text: 'Закончить', onPress: performComplete },
      ]);
      return;
    }
    const percent = Math.round((done / total) * 100);
    Alert.alert(
      'Закончить смену раньше?',
      `Пройдено ${done} из ${total} этапов урока — получишь ${percent}% бюджета, а бонус копилки не начислится. Урок сохранится: в следующую смену продолжишь с того же места.`,
      [
        { text: 'Продолжать', style: 'cancel' },
        { text: 'Закончить сейчас', onPress: performComplete },
      ]
    );
  };

  const handleNodePress = (index: number) => {
    if (!plan || !progress) return;
    if (index < plan.nodes.length && isNodeComplete(plan, progress, index)) {
      openLesson(index);
      return;
    }
    openLesson();
  };

  const sceneWidth = Math.min(screenWidth - SCENE_HORIZONTAL_PADDING * 2, SCENE_MAX_WIDTH);
  const sceneHeight = sceneWidth / SCENE_ASPECT_RATIO;
  const species = getPetSpecies(petType);
  const remainingLabel = countdown.expired
    ? 'Смена закончилась — итоги уже скоро'
    : `Смена закончится через ${formatDuration(countdown.remaining)}`;
  const step = position && plan ? describeStep(position, plan) : null;
  const savingsSoFar = computeAdventurePayout(adventure.budget, adventure.plan.savings).toBank;
  const spendLeft = planSpendRemaining(adventure);

  return (
    <View style={styles.container}>
      <View style={headerPadding}>
        <AppHeaderStats
          title="Работа"
          help="adventure"
          helpPosition="right"
          energy={currentMood}
          coins={coins}
          hideProfile
          leftAction={{
            icon: 'arrow-back',
            onPress: () => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)' as never);
            },
            accessibilityLabel: 'Назад на хаб',
          }}
          rightActions={[
            {
              icon: 'close',
              onPress: handleCompletePress,
              accessibilityLabel: 'Закончить смену раньше',
            },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sceneOuter}>
          <View style={[styles.sceneBox, { width: sceneWidth, height: sceneHeight }]}>
            <Image
              source={species.getWorkAsset(equippedSkinVariant)}
              style={styles.sceneImage}
              contentFit="contain"
              accessibilityLabel={`${species.displayName} работает`}
            />
          </View>
        </View>

        {plan && progress && (
          <>
            <View style={styles.progressPill}>
              <Text style={[styles.progressPillText, { fontSize: scaledFont('md') }]}>
                Работа: {done} из {total}
              </Text>
            </View>
            <AdventureNodeTrack plan={plan} progress={progress} onPressNode={handleNodePress} />
          </>
        )}
        <Text style={[styles.remainingTimeText, { fontSize: scaledFont('md') }]}>
          {remainingLabel}
        </Text>

        {step && (
          <TouchableOpacity
            onPress={() => (lessonDone ? handleCompletePress() : openLesson())}
            activeOpacity={0.85}
            style={styles.stepCard}
            accessibilityRole="button"
            accessibilityLabel={`${step.title}. ${step.subtitle}`}
          >
            <View style={[styles.stepIconBox, { backgroundColor: withAlpha(step.color, 0.16) }]}>
              <Ionicons name={step.icon} size={scale(24)} color={step.color} />
            </View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { fontSize: scaledFont('lg') }]}>{step.title}</Text>
              <Text style={[styles.stepSubtitle, { fontSize: scaledFont('md') }]}>
                {step.subtitle}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={scale(20)} color={theme.textSecondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => (lessonDone ? handleCompletePress() : openLesson())}
          disabled={!lesson}
          activeOpacity={0.85}
          style={styles.primaryButton}
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, { fontSize: scaledFont('lg') }]}>
            {lessonDone ? 'Закончить смену' : 'Начать задание'}
          </Text>
        </TouchableOpacity>

        <ShiftBudgetCard
          adventure={adventure}
          onPress={() => {
            triggerHaptic('light');
            setShowPlanModal(true);
          }}
        />
      </ScrollView>

      {showPlanModal && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setShowPlanModal(false)}
        >
          <View style={styles.planModalOverlay}>
            <TouchableOpacity style={styles.backdrop} onPress={() => setShowPlanModal(false)} />
            <View style={styles.planModalContent}>
              <View style={styles.planModalHeaderRow}>
                <Text style={[styles.planModalTitle, { fontSize: scaledFont('xl') }]}>План</Text>
                <IconButton
                  icon="close"
                  onPress={() => setShowPlanModal(false)}
                  accessibilityLabel="Закрыть план"
                />
              </View>

              <View style={styles.planModalBody}>
                <AdventurePlanFactCard
                  adventure={adventure}
                  tag={countdown.expired ? 'Смена закончилась' : 'Идёт смена'}
                  savingsFact={savingsSoFar}
                  savingsFactLabel="отложено"
                />
                <AdventureAmountCard
                  icon={<Ionicons name="wallet-outline" size={scale(26)} color={theme.primary} />}
                  iconBackground={withAlpha(theme.primary, 0.15)}
                  title="Бюджет работы:"
                  amount={adventure.budget}
                  lines={[
                    spendLeft >= 0
                      ? `можно потратить ещё ${formatPrice(spendLeft)}`
                      : `больше плана на ${formatPrice(-spendLeft)}`,
                    `урок: ${done} из ${total} этапов`,
                  ]}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
