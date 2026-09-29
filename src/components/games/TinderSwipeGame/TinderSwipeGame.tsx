// src/components/games/TinderSwipeGame/TinderSwipeGame.tsx
// Мини-игра в стиле Tinder/Reigns — свайпы для оценки финансовых ситуаций.
//
// Какой ответ на какой стороне — LessonPlan.swipeSides (решение пользователя
// 29.09.2026: «да» и «нет» иногда менялись местами — в контенте встречаются
// оба порядка). Вопрос «да / нет» (ответы «Да…» / «Нет…»): влево ✗ — «Нет»,
// вправо ✓ — «Да», всегда. Остальное — выбор из двух ответов: стрелки и
// подписи самими ответами, без «да / нет» (иначе «Составить список» стоял
// под «Нет»). Стороны, значки и цвета не зависят от правильного ответа —
// раньше ✓ ставилась на верный вариант, и ответ был виден заранее. Верно
// ли — видно только после свайпа. Под кнопками — что значит ответ.

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { swipeSides } from '@/domain/lesson/LessonPlan';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { withAlpha } from '@/theme/colorUtils';
import { createTinderSwipeGameStyles, SWIPE_THRESHOLD } from './TinderSwipeGame.styles';

interface TinderSwipeGameProps {
  question: string;
  options: string[];
  correctAnswer: string;
  /** Текст баннера обратной связи после свайпа (см. content/lessons/*.json) —
   * баннера не будет, если для вопроса не задан. */
  explanation?: string;
  /** Текст под ссылкой «Подсказка» — сама ссылка не показывается без него. */
  hint?: string;
  /** Цена подсказки (урок: hintPrice в content/lessons); 0/нет — бесплатно. */
  hintPrice?: number;
  /** Подсказка куплена. */
  hintUnlocked?: boolean;
  /** Купить подсказку (платит вызывающий код). */
  onUnlockHint?: () => void;
  /** Показать «N / M утверждений» внизу — оба значения нужны вместе. */
  progressCurrent?: number;
  progressTotal?: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function TinderSwipeGame({
  question,
  options,
  correctAnswer,
  explanation,
  hint,
  hintPrice = 0,
  hintUnlocked = false,
  onUnlockHint,
  progressCurrent,
  progressTotal,
  onAnswer,
  disabled = false,
}: TinderSwipeGameProps) {
  const { theme } = useTheme();
  const { width } = useResponsive();
  const { trigger, playSound, stopSound, triggerHaptic } = useFeedback();

  const [isAnimating, setIsAnimating] = useState(false);
  const [answeredOption, setAnsweredOption] = useState<string | null>(null);
  const [isHintRevealed, setIsHintRevealed] = useState(hintUnlocked);
  const hintLocked = Boolean(hint) && hintPrice > 0 && !hintUnlocked;
  // Подсказку только что купили — сразу показываем (подстройка состояния
  // при рендере, без эффекта).
  const [prevHintUnlocked, setPrevHintUnlocked] = useState(hintUnlocked);
  if (hintUnlocked !== prevHintUnlocked) {
    setPrevHintUnlocked(hintUnlocked);
    if (hintUnlocked) setIsHintRevealed(true);
  }
  // Ref, а не только state: гарантирует, что повторный swipe/tap в ту же
  // самую задачу микротасков не проскочит мимо проверки isAnimating из-за
  // устаревшего замыкания до того, как React применит setIsAnimating(true).
  const isProcessingRef = useRef(false);

  const styles = createTinderSwipeGameStyles({ theme });

  // Анимации карточки
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const likeOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);

  const sides = swipeSides(options);
  const leftOption = sides.left || 'Нет';
  const rightOption = sides.right || 'Да';

  const resetCard = () => {
    translateX.value = withSpring(0);
    rotate.value = withSpring(0);
    likeOpacity.value = withTiming(0, { duration: 150 });
    nopeOpacity.value = withTiming(0, { duration: 150 });
    setAnsweredOption(null);
  };

  // Единственная точка входа для обоих путей (жест и кнопки) — раньше
  // isAnimating выставлялся только в handleButtonSwipe, а сам свайп жестом
  // (panGesture.onEnd) вызывал эту функцию напрямую, ничего не блокируя. Из-за
  // задержки в 350мс до onAnswer окно было открыто для повторного свайпа —
  // второй быстрый свайп успевал запустить handleSwipeComplete ещё раз до
  // того, как onAnswer вообще срабатывал, и на один вопрос прилетало два
  // ответа. isProcessingRef проверяется и выставляется синхронно, поэтому не
  // ловит гонку устаревшего замыкания, в отличие от одного только state.
  const handleSwipeComplete = (direction: 'left' | 'right') => {
    if (disabled || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsAnimating(true);

    const chosenOption = direction === 'left' ? leftOption : rightOption;
    const isCorrect = chosenOption === correctAnswer;
    setAnsweredOption(chosenOption);

    // Звук свайпа — сразу, «верно / неверно» (звук + haptic) — когда карточка
    // улетела. card_flip.mp3 длится ~1 с, дольше вылета карточки, поэтому
    // перед звуком результата свайп обрываем — звуки не накладываются.
    playSound('cardFlip');

    // Анимируем вылет карточки
    const flyX = direction === 'left' ? -width : width;
    translateX.value = withTiming(flyX, { duration: 300 });
    rotate.value = withTiming(direction === 'left' ? -30 : 30, { duration: 300 });

    setTimeout(() => {
      stopSound('cardFlip');
      trigger(isCorrect ? 'correctAnswer' : 'wrongAnswer');
      onAnswer(chosenOption, isCorrect);
      setTimeout(() => {
        resetCard();
        setIsAnimating(false);
        isProcessingRef.current = false;
      }, 400);
    }, 350);
  };

  // Жест свайпа
  const panGesture = Gesture.Pan()
    .enabled(!disabled && !isAnimating)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = event.translationX / 20;

      if (event.translationX > 30) {
        likeOpacity.value = Math.min(event.translationX / SWIPE_THRESHOLD, 1);
        nopeOpacity.value = 0;
      } else if (event.translationX < -30) {
        nopeOpacity.value = Math.min(-event.translationX / SWIPE_THRESHOLD, 1);
        likeOpacity.value = 0;
      } else {
        likeOpacity.value = 0;
        nopeOpacity.value = 0;
      }
    })
    // .onEnd(fn) только СОХРАНЯЕТ fn для будущего вызова из нативного жеста
    // (через runOnJS, на JS-потоке), не выполняет его во время этого рендера —
    // линтер не умеет отличать билдер-API Gesture Handler от немедленного
    // вызова и репортит ложное срабатывание на чтение isProcessingRef.current
    // внутри handleSwipeComplete.
    // eslint-disable-next-line react-hooks/refs
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        runOnJS(handleSwipeComplete)(direction);
      } else {
        translateX.value = withSpring(0, { damping: 10 });
        rotate.value = withSpring(0, { damping: 10 });
        likeOpacity.value = withTiming(0, { duration: 200 });
        nopeOpacity.value = withTiming(0, { duration: 200 });
      }
    });

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (disabled || isAnimating) return;
    triggerHaptic('light');
    handleSwipeComplete(direction);
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${rotate.value}deg` }],
  }));

  const animatedLikeStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
    transform: [{ scale: likeOpacity.value }],
  }));

  const animatedNopeStyle = useAnimatedStyle(() => ({
    opacity: nopeOpacity.value,
    transform: [{ scale: nopeOpacity.value }],
  }));

  const isAnsweredCorrect = answeredOption !== null && answeredOption === correctAnswer;
  // «Да / нет» — красный и зелёный; выбор из двух — один нейтральный цвет:
  // цвет не должен намекать, какой ответ верный (смысл — в подписях, §23).
  const leftColor = sides.yesNo ? theme.error : theme.accent;
  const rightColor = sides.yesNo ? theme.success : theme.accent;

  return (
    <View style={styles.container}>
      {/* Результат — над стопкой карточек, показывается сразу по свайпу */}
      {answeredOption !== null && (
        <View
          style={[
            styles.feedbackContainer,
            {
              backgroundColor: isAnsweredCorrect
                ? withAlpha(theme.success, 0.15)
                : withAlpha(theme.error, 0.15),
              borderColor: isAnsweredCorrect
                ? withAlpha(theme.success, 0.4)
                : withAlpha(theme.error, 0.4),
            },
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              { color: isAnsweredCorrect ? theme.success : theme.error },
            ]}
          >
            {isAnsweredCorrect ? 'Верно' : 'Не совсем'}
            {explanation ? `: ${explanation}` : '!'}
          </Text>
        </View>
      )}

      {/* Область с карточкой: 2 декоративные карточки-«тени» позади для
          глубины стопки (без содержимого — следующий вопрос ещё не выбран
          на этом уровне, см. MinigameStep), сверху — рабочая карточка. */}
      <View style={styles.cardArea}>
        <View style={[styles.stackCardBase, styles.stackCardBack2]} />
        <View style={[styles.stackCardBase, styles.stackCardBack1]} />

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.card, animatedCardStyle]}>
            <View style={styles.cardInner}>
              {/* Угловые плашки — только у вопроса «да / нет»: влево «нет»,
                  вправо «да». В выборе из двух стороны подписаны кнопками. */}
              {sides.yesNo && (
                <>
                  <View
                    style={[styles.cornerPill, styles.cornerPillLeft, { borderColor: theme.error }]}
                  >
                    <Text style={[styles.cornerPillText, { color: theme.error }]}>← Нет</Text>
                  </View>
                  <View
                    style={[
                      styles.cornerPill,
                      styles.cornerPillRight,
                      { borderColor: theme.success },
                    ]}
                  >
                    <Text style={[styles.cornerPillText, { color: theme.success }]}>Да →</Text>
                  </View>
                </>
              )}

              <View style={styles.situationIconContainer}>
                <Ionicons name="lock-closed" size={32} color={theme.onGradient} />
              </View>

              <Text style={styles.situationLabel}>Ситуация</Text>

              <Text style={styles.questionText}>{question}</Text>

              {/* Индикатор при свайпе вправо — «да» или правый ответ */}
              <Animated.View
                style={[styles.likeBadge, { borderColor: rightColor }, animatedLikeStyle]}
              >
                <Text style={[styles.swipeFeedbackText, { color: rightColor }]} numberOfLines={2}>
                  {sides.yesNo ? '✓ Да' : `${rightOption} →`}
                </Text>
              </Animated.View>

              {/* Индикатор при свайпе влево — «нет» или левый ответ */}
              <Animated.View
                style={[styles.nopeBadge, { borderColor: leftColor }, animatedNopeStyle]}
              >
                <Text style={[styles.swipeFeedbackText, { color: leftColor }]} numberOfLines={2}>
                  {sides.yesNo ? '✗ Нет' : `← ${leftOption}`}
                </Text>
              </Animated.View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Кнопки свайпа: у вопроса «да / нет» ✗ — «нет», ✓ — «да», у выбора
          из двух — стрелки; под кнопкой — что значит этот ответ. */}
      <View style={styles.buttonsContainer}>
        {(
          [
            {
              direction: 'left',
              icon: sides.yesNo ? 'close' : 'arrow-back',
              color: leftColor,
              label: leftOption,
              word: sides.yesNo ? 'Нет' : 'Влево',
            },
            {
              direction: 'right',
              icon: sides.yesNo ? 'checkmark' : 'arrow-forward',
              color: rightColor,
              label: rightOption,
              word: sides.yesNo ? 'Да' : 'Вправо',
            },
          ] as const
        ).map((button) => (
          <View key={button.direction} style={styles.buttonColumn}>
            <TouchableOpacity
              onPress={() => handleButtonSwipe(button.direction)}
              disabled={disabled || isAnimating}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${button.word}: ${button.label}`}
              style={[styles.swipeButtonOuter, { backgroundColor: withAlpha(button.color, 0.2) }]}
            >
              <View style={[styles.swipeButtonInner, { borderColor: button.color }]}>
                <Ionicons name={button.icon} size={32} color={button.color} />
              </View>
            </TouchableOpacity>
            <Text style={styles.buttonCaption} numberOfLines={2}>
              {button.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Прогресс + подсказка */}
      <View style={styles.footerRow}>
        {progressCurrent !== undefined && progressTotal !== undefined && (
          <Text style={styles.progressCaption}>
            {progressCurrent} / {progressTotal} утверждений
          </Text>
        )}
        {hint &&
          (hintLocked ? (
            // Платная подсказка (решение 29.09.2026): цена — у кнопки.
            <TouchableOpacity
              onPress={onUnlockHint}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Подсказка за ${formatCoins(hintPrice)}`}
            >
              <Text style={styles.hintLink}>Подсказка · {formatPrice(hintPrice)}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsHintRevealed((v) => !v)} activeOpacity={0.7}>
              <Text style={styles.hintLink}>
                {isHintRevealed ? 'Скрыть подсказку' : 'Подсказка'}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
      {hint && !hintLocked && isHintRevealed && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}
