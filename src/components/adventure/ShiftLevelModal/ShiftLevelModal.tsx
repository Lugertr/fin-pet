// src/components/adventure/ShiftLevelModal/ShiftLevelModal.tsx
// Окно «Опыт и уровень» на хабе — следом за итогами смены (решение
// пользователя 29.09.2026), если урок смены дал опыт. Полоска опыта доезжает
// от «было» до «стало»; при новом уровне — заливка до конца, затем новый
// уровень и карточка уровня: звание, монеты, облик в хранилище с «Надеть» /
// «Оставить текущий» (LevelUpCard). Опыт и награды уже начислены
// (useLessonsStore.finishLesson) — окно только показывает.

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { LevelUpCard } from '@/components/shared';
import { AnimatedFill } from '@/components/ui';
import { LevelInfo, computeLevel, getLevelTitle } from '@/domain/player/PlayerLevel';
import type { ShiftXpReport } from '@/lib/stores/adventureStore';
import { useResponsive, useTheme } from '@/theme';
import { createShiftLevelModalStyles } from './ShiftLevelModal.styles';

/** Заливка начинается, когда окно проявилось; полная полоска держится
 * заметное время, потом — новый уровень (заливка AnimatedFill — 320 мс). */
const FILL_DELAY_MS = 600;
const LEVEL_SWITCH_MS = FILL_DELAY_MS + 1200;

function percentOf(info: LevelInfo): number {
  return Math.round((info.xpIntoLevel / info.xpForNext) * 100);
}

export function ShiftLevelModal({
  report,
  onClose,
}: {
  report: ShiftXpReport;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createShiftLevelModalStyles({ theme });

  const before = computeLevel(report.totalAfter - report.gained);
  const after = computeLevel(report.totalAfter);
  const leveledUp = after.level > before.level;

  // Полоска: уровень «было» → заливка → (новый уровень) → остаток опыта.
  // key перемонтирует заливку с нуля на новом уровне, а не отматывает назад.
  const [bar, setBar] = useState({ level: before.level, percent: percentOf(before), key: 0 });
  const [showLevelCard, setShowLevelCard] = useState(false);

  useEffect(() => {
    const target = percentOf(after);
    const timers = [
      setTimeout(() => setBar((b) => ({ ...b, percent: leveledUp ? 100 : target })), FILL_DELAY_MS),
    ];
    if (leveledUp) {
      timers.push(
        setTimeout(() => setBar({ level: after.level, percent: 0, key: 1 }), LEVEL_SWITCH_MS),
        setTimeout(() => {
          setBar((b) => ({ ...b, percent: target }));
          setShowLevelCard(true);
        }, LEVEL_SWITCH_MS + 50)
      );
    }
    return () => timers.forEach(clearTimeout);
    // Разовая анимация при показе окна.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toNext = after.xpForNext - after.xpIntoLevel;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={theme.gradients.reward}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={{ fontSize: scale(48) }}>{leveledUp ? '🎉' : '⭐'}</Text>
            <Text style={[styles.heroTitle, { fontSize: scaledFont('xxl') }]}>
              {leveledUp ? 'Новый уровень!' : 'Опыт за смену'}
            </Text>
            <Text style={[styles.heroSubtitle, { fontSize: scaledFont('lg') }]}>
              +{report.gained} опыта за урок смены
            </Text>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.body}>
            <View style={styles.levelRow}>
              {/* Звание нового уровня — в карточке уровня ниже, здесь не дублируем. */}
              <Text style={[styles.levelTitle, { fontSize: scaledFont('lg') }]}>
                {showLevelCard
                  ? `Уровень ${bar.level}`
                  : `Уровень ${bar.level}: «${getLevelTitle(bar.level)}»`}
              </Text>
            </View>
            <View
              style={styles.barTrack}
              accessibilityRole="progressbar"
              accessibilityLabel={`Опыт: ${after.xpIntoLevel} из ${after.xpForNext} на уровне ${after.level}`}
              accessibilityValue={{ min: 0, max: after.xpForNext, now: after.xpIntoLevel }}
            >
              <AnimatedFill
                key={bar.key}
                percent={bar.percent}
                color={theme.primary}
                style={styles.barFill}
              />
            </View>
            {/* Смысл полоски — и текстом (§23); при новом уровне — когда полоска
                уже на нём, иначе подпись опережала бы заливку. */}
            {(!leveledUp || showLevelCard) && (
              <Text style={[styles.hint, { fontSize: scaledFont('md') }]}>
                {after.xpIntoLevel} из {after.xpForNext} опыта · до уровня {after.level + 1} ещё{' '}
                {toNext}
              </Text>
            )}

            {leveledUp && report.levelUp && showLevelCard && (
              <LevelUpCard levelUp={report.levelUp} />
            )}

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={styles.closeButton}
              accessibilityRole="button"
            >
              <Text style={[styles.closeText, { fontSize: scaledFont('lg') }]}>Дальше</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
