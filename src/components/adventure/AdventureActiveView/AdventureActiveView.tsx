// src/components/adventure/AdventureActiveView/AdventureActiveView.tsx
// Активная фаза «Приключения» — отдельный экран (app/(modal)/adventure.tsx),
// открывается с хаба. Порядок сверху вниз: шапка (слева «назад» на хаб,
// справа «?» и ✕ — завершить досрочно — рядом с монетами и энергией),
// сцена «работы» с питомцем, полоска прогресса с оставшимся временем, задание
// по выбранной ветке, внизу — тема урока и кнопка «План». «Банка» здесь нет:
// он только на хабе (тап по копилке) — деньги приключения живут отдельно.
// Случайные события проверяются, только пока вкладка в фокусе. Итоги здесь не
// показываются: после завершения (✕ или само, когда время вышло) хаб
// возвращается и открывает AdventureSummaryModal.

import { Ionicons } from '@expo/vector-icons';
import { getLocalContentRepository } from '@/data/content';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useIsFocused, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { PetSprite } from '@/components/pet';
import { AppHeaderStats, CoinAmount, useAppHeaderPadding } from '@/components/shared';
import { Card, IconButton } from '@/components/ui';
import { actualSpend, plannedSpend } from '@/domain/adventure/Adventure';
import { buildQuestTrainerSession } from '@/domain/arcade/TrainerSelection';
import { formatDuration } from '@/lib/adventure/formatDuration';
import { ARCADE_SOURCES } from '@/lib/arcade/arcadeSources';
import { useAdventureCountdown } from '@/lib/adventure/useAdventureCountdown';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { useArcadeSessionStore } from '@/lib/stores/arcadeSessionStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatPrice } from '@/lib/utils/formatters';
import { colorPalettes } from '@/theme/tokens';
import { useResponsive, useTheme } from '@/theme';
import { AdventureEventModal } from '../AdventureEventModal';
import { createAdventureActiveViewStyles } from './AdventureActiveView.styles';

const WORKSPACE_BACKGROUND = require('../../../../assets/images/adventure/workspace-background.svg');
const ADVENTURE_EVENTS = getLocalContentRepository().getAdventureEventsSync();
const EVENT_CHECK_INTERVAL_MS = 30_000;
// Первую проверку событий (trigger 'entry' — может сработать раньше обычного
// часового срока, см. EVENT_PACING) откладываем на несколько секунд после
// захода на экран — иначе модалка события выскакивала бы в первый же миг,
// раньше, чем ребёнок успеет увидеть сцену и план/факт.
const EVENT_CHECK_INITIAL_DELAY_MS = 5_000;
// Демо-режим (§18): событие при каждом заходе — почти сразу, показ идёт 1–2 минуты.
const DEMO_EVENT_CHECK_INITIAL_DELAY_MS = 1_500;
// Сцена ограничена по ширине — на широких экранах/планшетах фон иначе
// разрастался и перекрывал остальной контент, а питомец превращался в точку.
// Потолок не срабатывает на обычном телефоне — ограничивает только широкие окна.
const SCENE_MAX_WIDTH = 640;
const SCENE_ASPECT_RATIO = 4 / 3;
const SCENE_HORIZONTAL_PADDING = 24;

export function AdventureActiveView() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont, width: screenWidth } = useResponsive();
  const headerPadding = useAppHeaderPadding();
  const { triggerHaptic } = useFeedback();
  const completeAdventure = useAdventureStore((s) => s.completeAdventure);
  const checkForDueEvent = useAdventureStore((s) => s.checkForDueEvent);
  const resolveEvent = useAdventureStore((s) => s.resolveEvent);
  const getNextLessonInBranch = useLessonsStore((s) => s.getNextLessonInBranch);
  const getBranchProgress = useLessonsStore((s) => s.getBranchProgress);
  const petType = usePreferencesStore((s) => s.petType);
  const currentMood = usePetStore((s) => s.currentMood);
  const equippedSkinVariant = usePetStore((s) => s.equippedSkinVariant);
  const coins = useUserStore((s) => s.user?.liquid_balance ?? 0);
  const isDemo = useUserStore((s) => s.user?.is_demo ?? false);

  const styles = createAdventureActiveViewStyles({ theme });
  // Модалку события можно закрыть тапом на фон, не выбирая — она останется
  // "нерешённой" в данных (блокирует завершение), но не будет мешать
  // остальным действиям. dismissedEventId запоминает, какое именно событие
  // уже закрывали, чтобы новое снова показалось.
  const [dismissedEventId, setDismissedEventId] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const countdown = useAdventureCountdown();
  // Вкладка остаётся смонтированной под уроком/магазином, открытыми поверх
  // или рядом, — без проверки фокуса события рождались бы (и их Modal
  // всплывал бы) посреди урока.
  const isFocused = useIsFocused();

  // Проверка «не пора ли новое событие» — только пока вкладка в фокусе: при
  // заходе (в т.ч. возврате с урока) — 'entry' с небольшой задержкой, дальше
  // раз в 30с — 'tick'.
  useFocusEffect(
    useCallback(() => {
      if (!countdown.active) return;
      const initialCheck = setTimeout(
        () => checkForDueEvent('entry'),
        isDemo ? DEMO_EVENT_CHECK_INITIAL_DELAY_MS : EVENT_CHECK_INITIAL_DELAY_MS
      );
      const interval = setInterval(() => checkForDueEvent('tick'), EVENT_CHECK_INTERVAL_MS);
      return () => {
        clearTimeout(initialCheck);
        clearInterval(interval);
      };
    }, [countdown.active, checkForDueEvent, isDemo])
  );

  // Время вышло, пока открыт этот экран, — завершаем сразу (итоги — на хабе).
  const completeIfExpired = useAdventureStore((s) => s.completeIfExpired);
  const isExpiredNow = countdown.active && countdown.expired;
  useEffect(() => {
    if (isFocused && isExpiredNow) void completeIfExpired();
  }, [isFocused, isExpiredNow, completeIfExpired]);

  // Приключение завершено (✕ или время вышло) — назад на хаб, там итоги.
  useEffect(() => {
    if (!isFocused || countdown.active) return;
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)' as never);
  }, [isFocused, countdown.active, router]);

  // Хаб рендерит этот экран только для активного приключения; автозавершение
  // по времени тоже на хабе (см. app/(tabs)/index.tsx).
  if (!countdown.active) return null;

  const { adventure, timeUp, expired, remaining, progressRatio } = countdown;
  const branch = BRANCHES.find((b) => b.id === adventure.branchId);
  const nextLesson = getNextLessonInBranch(adventure.branchId as number);
  const branchProgress = getBranchProgress(adventure.branchId as number);
  const branchFullyDone =
    branchProgress.total > 0 && branchProgress.completed === branchProgress.total;
  const progressPercent = Math.round(progressRatio * 100);

  const pendingTemplate = adventure.pendingEventTemplateId
    ? (ADVENTURE_EVENTS.find((t) => t.id === adventure.pendingEventTemplateId) ?? null)
    : null;
  // После окончания времени событие уже не решить — его снимет автозавершение.
  const showEventModal =
    pendingTemplate !== null && dismissedEventId !== pendingTemplate.id && isFocused && !expired;

  const handleQuest = () => {
    triggerHaptic('light');
    if (nextLesson) {
      router.push(`/(modal)/lesson/${nextLesson.id}` as never);
      return;
    }
    // Ветка уже пройдена на 100% (подтверждено на планировании) — задание
    // идёт через Аркаду: раунд случайной игры этой темы с countsAsQuest, и
    // arcade.tsx при получении награды засчитывает его как задание.
    if (branchFullyDone && adventure.branchId !== null) {
      const trainerSession = buildQuestTrainerSession(adventure.branchId, ARCADE_SOURCES, isDemo);
      if (!trainerSession) {
        Alert.alert('Недоступно', 'Для этой темы пока нет вопросов для тренировки');
        return;
      }
      useArcadeSessionStore.getState().startSession(trainerSession);
      router.push('/(modal)/arcade' as never);
    }
  };

  // Ведёт на выбор мини-игры по теме приключения ((modal)/arcade-lobby), а не
  // сразу в игру: (modal)/arcade ждёт готовую TrainerSession в useArcadeSessionStore.
  const handleOpenArcade = () => {
    triggerHaptic('light');
    router.push('/(modal)/arcade-lobby' as never);
  };

  const handleChooseEventOption = (optionId: string) => {
    resolveEvent(optionId);
    setDismissedEventId(null);
  };

  const handleDismissEvent = () => {
    if (pendingTemplate) setDismissedEventId(pendingTemplate.id);
  };

  // При успехе ничего делать не нужно: стор обнулит currentAdventure, хаб
  // вернётся на место этого экрана и покажет итоги (lastCompletionSummary).
  const performComplete = async () => {
    triggerHaptic('medium');
    const result = await completeAdventure();
    // null при уже пустом сторе — приключение в этот момент завершилось само
    // (completeIfExpired), это не ошибка.
    if (!result && useAdventureStore.getState().currentAdventure) {
      Alert.alert('Не получилось', 'Не удалось завершить приключение, попробуй ещё раз');
    }
  };

  // ✕ справа сверху — единственная ручная точка завершения. Всегда через
  // подтверждение: крестик легко задеть случайно, а завершение необратимо.
  // Досрочное завершение — не ошибка и не провал (§8), награда не обнуляется,
  // а лишь пропорционально уменьшается (см. adventureStore.completeAdventure) —
  // предупреждаем об этом заранее и даём передумать.
  const handleCompletePress = () => {
    triggerHaptic('light');
    if (pendingTemplate && !expired) {
      Alert.alert(
        'Сначала реши событие',
        'Приключение нельзя завершить, пока есть нерешённое событие.',
        [
          { text: 'Позже', style: 'cancel' },
          { text: 'Открыть событие', onPress: () => setDismissedEventId(null) },
        ]
      );
      return;
    }
    if (timeUp) {
      Alert.alert('Завершить приключение?', 'Итоги появятся сразу после завершения.', [
        { text: 'Продолжать', style: 'cancel' },
        { text: 'Завершить', onPress: performComplete },
      ]);
      return;
    }
    Alert.alert(
      'Завершить приключение раньше времени?',
      `Пройдено ${progressPercent}% приключения. Если закончить сейчас, получишь только ${progressPercent}% бюджета и опыта, а бонус банка не начислится.`,
      [
        { text: 'Продолжать', style: 'cancel' },
        { text: 'Завершить сейчас', onPress: performComplete },
      ]
    );
  };

  // Ширина сцены — вся доступная ширина за вычетом отступов, но не больше
  // SCENE_MAX_WIDTH; высота — по фиксированному соотношению сторон фона;
  // размер питомца — доля от РЕАЛЬНОЙ ширины сцены, а не константа, поэтому
  // остаётся заметным независимо от размера экрана.
  const sceneWidth = Math.min(screenWidth - SCENE_HORIZONTAL_PADDING * 2, SCENE_MAX_WIDTH);
  const sceneHeight = sceneWidth / SCENE_ASPECT_RATIO;
  const petSize = Math.round(sceneWidth * 0.28);
  // Оставшееся время — по реальным часам (не демо-флаг timeUp, который в
  // демо-профиле истинен сразу и показал бы «время вышло» с первой минуты).
  const remainingLabel = expired ? 'Время вышло' : `Осталось ${formatDuration(remaining)}`;

  return (
    <View style={styles.container}>
      <View style={headerPadding}>
        <AppHeaderStats
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
              accessibilityLabel: 'Завершить приключение досрочно',
            },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sceneOuter}>
          <View style={[styles.sceneBox, { width: sceneWidth, height: sceneHeight }]}>
            <Image
              source={WORKSPACE_BACKGROUND}
              style={styles.sceneBackground}
              contentFit="cover"
            />
            <View style={[styles.scenePetWrap, { transform: [{ translateX: -petSize / 2 }] }]}>
              <PetSprite
                petType={petType}
                mood={currentMood}
                skinVariant={equippedSkinVariant}
                size={petSize}
              />
            </View>
          </View>

          <View style={[styles.timeBlock, { width: sceneWidth }]}>
            <View
              style={styles.progressBarTrack}
              accessibilityRole="progressbar"
              accessibilityLabel={`${branch?.name ?? 'Приключение'}: ${remainingLabel}`}
              accessibilityValue={{ min: 0, max: 100, now: progressPercent }}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={[styles.remainingTimeText, { fontSize: scaledFont('md') }]}>
              {remainingLabel}
            </Text>
            {/* Бюджет приключения — свои деньги приключения на события (не кошелёк хаба). */}
            <CoinAmount
              amount={adventure.budget}
              prefix="Бюджет приключения: "
              fontSize={scaledFont('md')}
              style={styles.budgetRow}
              textStyle={styles.budgetText}
            />
          </View>
        </View>

        {pendingTemplate && !showEventModal && !expired && (
          <TouchableOpacity
            onPress={() => setDismissedEventId(null)}
            activeOpacity={0.8}
            style={styles.eventBanner}
          >
            <Text style={[styles.secondaryButtonText, { fontSize: scaledFont('md') }]}>
              ❗ Есть нерешённое событие — открыть
            </Text>
          </TouchableOpacity>
        )}

        {/* Задание приключения + аркада рядом (аркада — только здесь, в хабе
            её нет: играть можно, когда приключение уже идёт). */}
        <View style={[styles.questRow, styles.blockSpacing]}>
          <TouchableOpacity
            onPress={handleQuest}
            disabled={!nextLesson && !branchFullyDone}
            activeOpacity={0.8}
            style={[
              styles.primaryButton,
              styles.questButton,
              !nextLesson && !branchFullyDone && styles.buttonDisabled,
            ]}
          >
            <Text style={[styles.primaryButtonText, { fontSize: scaledFont('lg') }]}>
              {nextLesson
                ? 'Выполнить задание'
                : branchFullyDone
                  ? 'Тренировка (задание)'
                  : 'Заданий нет'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleOpenArcade}
            activeOpacity={0.8}
            style={styles.arcadeButton}
            accessibilityRole="button"
            accessibilityLabel="Аркада: мини-игры по теме приключения"
          >
            <Ionicons name="game-controller" size={scale(22)} color={theme.warning} />
          </TouchableOpacity>
        </View>

        <Card padding="md" style={styles.blockSpacing}>
          <Text style={[styles.lessonInfoTopic, { fontSize: scaledFont('xs') }]}>
            {branch?.name ?? 'Приключение'}
          </Text>
          <Text style={[styles.lessonInfoTitle, { fontSize: scaledFont('lg') }]} numberOfLines={2}>
            {nextLesson
              ? nextLesson.title
              : branchFullyDone
                ? 'Все уроки пройдены — тренировка'
                : 'Заданий нет'}
          </Text>
        </Card>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            setShowPlanModal(true);
          }}
          activeOpacity={0.8}
          style={styles.quickActionCard}
          accessibilityRole="button"
          accessibilityLabel="Открыть план приключения"
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: `${colorPalettes.indigo[500]}20` },
            ]}
          >
            <Text>📋</Text>
          </View>
          <View style={styles.quickActionTextColumn}>
            <Text style={[styles.quickActionTitle, { fontSize: scaledFont('md') }]}>План</Text>
            <Text style={[styles.quickActionSubtitle, { fontSize: scaledFont('xs') }]}>
              потратить · коплю
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={scale(18)} color={theme.textSecondary} />
        </TouchableOpacity>
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

              <Text style={[styles.rowLabel, { fontSize: scaledFont('sm') }]}>
                Бюджет приключения
              </Text>
              <CoinAmount
                amount={adventure.budget}
                fontSize={scaledFont('md')}
                style={styles.valueRow}
                textStyle={styles.rowValue}
              />
              <Text style={[styles.rowLabel, { fontSize: scaledFont('sm') }]}>
                Потратить (потрачено / по плану)
              </Text>
              <CoinAmount
                amount={plannedSpend(adventure)}
                prefix={`${actualSpend(adventure)} / `}
                fontSize={scaledFont('md')}
                style={styles.valueRow}
                textStyle={styles.rowValue}
              />
              <Text style={[styles.rowLabel, { fontSize: scaledFont('sm') }]}>
                Из них на нужное: {formatPrice(adventure.fact.mandatory)}, на желаемое:{' '}
                {formatPrice(adventure.fact.optional)}
              </Text>
              <Text style={[styles.rowLabel, { fontSize: scaledFont('sm') }]}>
                Коплю — в конце уйдёт в банк
              </Text>
              <CoinAmount
                amount={adventure.plan.savings}
                fontSize={scaledFont('md')}
                style={styles.valueRow}
                textStyle={styles.rowValue}
              />
              <Text style={[styles.rowLabel, { fontSize: scaledFont('sm') }]}>
                Пройдено заданий: {adventure.questsCompleted}
              </Text>
            </View>
          </View>
        </Modal>
      )}

      {pendingTemplate && showEventModal && (
        <AdventureEventModal
          template={pendingTemplate}
          onChoose={handleChooseEventOption}
          onDismiss={handleDismissEvent}
        />
      )}
    </View>
  );
}
