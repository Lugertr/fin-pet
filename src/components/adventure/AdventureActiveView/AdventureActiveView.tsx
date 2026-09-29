// src/components/adventure/AdventureActiveView/AdventureActiveView.tsx
// Экран смены «Работа» (макет, 28.09.2026) — отдельный экран
// (app/(modal)/adventure.tsx), открывается с хаба. Смена = один урок:
// сверху — сцена «питомец работает» (work.svg вида и скина), плашка
// «Работа: 2 из 5» и трек этапов урока; дальше — «Начать задание» (этап
// начинается с ситуации и теории, урок продолжается с того же места), под
// ним — «Бюджет работы» (тап — окно «План»). Отдельной карточки «Ситуация и
// теория» нет (решение 29.09.2026): это начало этапа, а пройденный этап на
// треке открывается, чтобы перечитать и перепройти. В шапке: «назад» на хаб, «?» и ✕ — закончить
// смену раньше. Итоги здесь не показываются: смена завершилась (урок пройден,
// ✕ или 24 часа вышли) — экран сам возвращается на хаб, там итоги.
// Демо-режим: под «Начать задание» — «Завершить урок» (решение пользователя
// 29.09.2026): урок засчитан разом (без звезды), смена закрыта с его опытом —
// на хабе итоги и окно «Опыт и уровень».

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
import { MOOD_MAX } from '@/constants/gameplay';
import { planForLesson } from '@/domain/lesson/LessonPlan';
import {
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
import { isPetEnergyFull, usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { AdventureAmountCard } from '../AdventureAmountCard';
import { AdventureNodeTrack } from '../AdventureNodeTrack';
import { AdventurePlanFactCard } from '../AdventurePlanFactCard';
import { CoffeeButton } from '../CoffeeButton';
import { lessonCoffee } from '@/domain/lesson/lessonEconomy';
import { ensureStageEnergy } from '@/lib/adventure/stageEnergy';
import { ShiftBudgetCard } from '../ShiftBudgetCard';
import { createAdventureActiveViewStyles } from './AdventureActiveView.styles';

// Сцена ограничена по ширине — на широких экранах/планшетах картинка иначе
// разрасталась и перекрывала остальной контент.
const SCENE_MAX_WIDTH = 520;
// Соотношение сторон work.svg (297×275) — одинаковое у всех видов и скинов.
const SCENE_ASPECT_RATIO = 297 / 275;
const SCENE_HORIZONTAL_PADDING = 16;

/** Урок смены: зафиксированный при старте; у смены старой модели — следующий урок темы. */
function shiftLesson(adventure: AdventureRecord, nextInBranch: Lesson | null): Lesson | null {
  if (adventure.lessonId !== null) return LESSONS.find((l) => l.id === adventure.lessonId) ?? null;
  return nextInBranch;
}

export function AdventureActiveView() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont, width: screenWidth } = useResponsive();
  const headerPadding = useAppHeaderPadding();
  const { triggerHaptic } = useFeedback();
  const completeAdventure = useAdventureStore((s) => s.completeAdventure);
  const completeIfExpired = useAdventureStore((s) => s.completeIfExpired);
  const buyCoffee = useAdventureStore((s) => s.buyCoffee);
  const getNextLessonInBranch = useLessonsStore((s) => s.getNextLessonInBranch);
  const lessonStates = useLessonsStore((s) => s.lessonStates);
  const petType = usePreferencesStore((s) => s.petType);
  const currentMood = usePetStore((s) => s.currentMood);
  const moodMaxBonus = usePetStore((s) => s.moodMaxBonus);
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
    // Новый этап стоит энергии (content/lessons) — не хватает, не пускаем с
    // объяснением; перечитать пройденный этап (node) — бесплатно.
    if (node === undefined && !ensureStageEnergy(lesson.id, lesson.branch_id)) return;
    triggerHaptic('light');
    router.push(
      `/(modal)/lesson/${lesson.id}${node !== undefined ? `?node=${node}` : ''}` as never
    );
  };

  const position = plan && progress ? currentPosition(plan, progress) : null;
  const done = plan && progress ? completedNodeCount(plan, progress) : 0;
  const total = plan ? totalNodeCount(plan) : 0;
  const lessonDone = position?.kind === 'done';
  // Урок смены убрали из content/lessons (обновление контента) — проходить нечего.
  const lessonMissing = adventure.lessonId !== null && !lesson;
  // Цена текущего этапа — в кнопке «Начать задание» (финальный этап бесплатный).
  const stageCost =
    position?.kind === 'reading' || position?.kind === 'activity' ? position.node.energyCost : 0;
  // Первый этап — «Теория» (решение 29.09.2026): кнопка так и называется.
  const isTheoryStage = position?.kind === 'reading' && position.node.kind === 'theory';
  const startLabel = isTheoryStage ? 'Читать теорию' : 'Начать задание';
  // Кофе — раз за смену, из бюджета работы (content/lessons: coffee).
  const coffee = lesson ? lessonCoffee(lesson) : null;
  // Кофе можно с первого этапа, но не при полной энергии (решение 29.09.2026):
  // прибавлять нечего, монеты ушли бы впустую — кнопка заблокирована.
  const energyFull = currentMood >= MOOD_MAX + moodMaxBonus;
  const handleCoffee = async () => {
    if (!coffee) return;
    triggerHaptic('light');
    if (!adventure.coffeeBought && (energyFull || isPetEnergyFull())) {
      Alert.alert(
        'Энергия и так полная',
        'Кофе пригодится, когда энергии станет меньше. Он продаётся один раз за смену.'
      );
      return;
    }
    const bought = await buyCoffee(coffee);
    if (!bought) {
      Alert.alert(
        'Кофе не купить',
        adventure.coffeeBought
          ? 'Кофе уже был в этой смене — он один раз за смену.'
          : `Кофе стоит ${formatPrice(coffee.price)}, а в бюджете смены меньше.`
      );
    }
  };

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
  // продолжится в следующую смену, а выплата — за этапы, пройденные в этой
  // смене (решение 29.09.2026).
  const handleCompletePress = () => {
    triggerHaptic('light');
    if (lessonMissing) {
      Alert.alert(
        'Закончить смену?',
        'Урок этой смены обновили — за неё зарплата не начислится. Закончи смену и начни новую.',
        [
          { text: 'Продолжать', style: 'cancel' },
          { text: 'Закончить', onPress: performComplete },
        ]
      );
      return;
    }
    if (lessonDone || isDemo || total === 0) {
      Alert.alert('Закончить смену?', 'Итоги появятся на хабе.', [
        { text: 'Продолжать', style: 'cancel' },
        { text: 'Закончить', onPress: performComplete },
      ]);
      return;
    }
    const doneAtStart = Math.min(adventure.stagesDoneAtStart, done);
    const remaining = total - doneAtStart;
    const doneInShift = done - doneAtStart;
    const percent = remaining > 0 ? Math.round((doneInShift / remaining) * 100) : 0;
    Alert.alert(
      'Закончить смену раньше?',
      `За эту смену пройдено этапов: ${doneInShift} из ${remaining} — получишь ${percent}% того, что осталось в бюджете смены, а бонус копилки не начислится. Урок сохранится: в следующую смену продолжишь с того же места.`,
      [
        { text: 'Продолжать', style: 'cancel' },
        { text: 'Закончить сейчас', onPress: performComplete },
      ]
    );
  };

  // Демо: урок засчитан целиком (опыт — уровень), смена закрыта с его опытом.
  const handleDemoFinishLesson = async () => {
    if (!lesson) return;
    triggerHaptic('medium');
    const result = useLessonsStore.getState().completeLessonNow(lesson.id);
    if (!result) return;
    const summary = await completeAdventure(result.reward);
    if (!summary && useAdventureStore.getState().currentAdventure) {
      Alert.alert('Не получилось', 'Не удалось закончить смену, попробуй ещё раз');
    }
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
  const savingsSoFar = computeAdventurePayout(adventure.budget, adventure.plan.savings).toBank;
  const spendLeft = planSpendRemaining(adventure);

  return (
    <View style={styles.container}>
      <View style={headerPadding}>
        <AppHeaderStats
          title="Смена"
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
            {/* Кофе — квадратная кнопка в углу сцены (макет 29.09.2026). */}
            {coffee && !lessonDone && (
              <CoffeeButton
                coffee={coffee}
                used={adventure.coffeeBought}
                energyFull={energyFull}
                onPress={() => void handleCoffee()}
              />
            )}
          </View>
        </View>

        {plan && progress && (
          <>
            <View style={styles.progressPill}>
              <Text style={[styles.progressPillText, { fontSize: scaledFont('md') }]}>
                Смена: {done} из {total}
              </Text>
            </View>
            <AdventureNodeTrack plan={plan} progress={progress} onPressNode={handleNodePress} />
          </>
        )}
        <Text style={[styles.remainingTimeText, { fontSize: scaledFont('md') }]}>
          {remainingLabel}
        </Text>
        {lessonMissing && (
          <Text style={[styles.remainingTimeText, { fontSize: scaledFont('md') }]}>
            Урок этой смены обновили. Закончи смену крестиком сверху и начни новую.
          </Text>
        )}

        <TouchableOpacity
          onPress={() => (lessonDone ? handleCompletePress() : openLesson())}
          disabled={!lesson}
          activeOpacity={0.85}
          style={styles.primaryButton}
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, { fontSize: scaledFont('lg') }]}>
            {lessonDone
              ? 'Закончить смену'
              : stageCost > 0
                ? `${startLabel} · −${stageCost}⚡`
                : startLabel}
          </Text>
        </TouchableOpacity>

        {isDemo && lesson && !lessonDone && (
          <TouchableOpacity
            onPress={() => void handleDemoFinishLesson()}
            activeOpacity={0.85}
            style={styles.demoFinishButton}
            accessibilityRole="button"
            accessibilityLabel="Демо: завершить урок сразу"
          >
            <Text style={[styles.demoFinishButtonText, { fontSize: scaledFont('md') }]}>
              Завершить урок (демо)
            </Text>
          </TouchableOpacity>
        )}

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
                  title="Бюджет смены:"
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
