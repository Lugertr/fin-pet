// src/components/adventure/AdventureSummaryModal/AdventureSummaryModal.tsx
// Итоги смены (макет «Итоги работы», 28.09.2026) — полноэкранное окно на хабе:
// урок пройден, смену закончили раньше (✕) или 24 часа вышли (см.
// adventureStore.completeIfExpired). Сверху — карточка-герой с иконкой
// питомца reward.svg (вид и скин), ниже «План и факт» (AdventurePlanFactCard),
// «Перенос в копилку» — куда ушёл бюджет смены; если урок не закончен — где
// он продолжится. Внизу — «Домой» и «Новая работа». Данные — снимок
// AdventureCompletionSummary, награды к этому моменту уже начислены.
// Ошибка не наказывается (§8): если трат больше плана — нейтральный тон.

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetAvatarBubble } from '@/components/pet';
import { HelpButton } from '@/components/shared';
import { FURNITURE_ASSETS } from '@/constants/itemAssets';
import { PLAN_CATEGORY_COLORS } from '@/constants/planCategories';
import { isPlanBonusEligible } from '@/domain/adventure/Adventure';
import { useFeedback } from '@/lib/hooks/useFeedback';
import type { AdventureCompletionSummary } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes } from '@/theme/tokens';
import { AdventureAmountCard } from '../AdventureAmountCard';
import { AdventurePlanFactCard } from '../AdventurePlanFactCard';
import { createAdventureSummaryModalStyles } from './AdventureSummaryModal.styles';

export function AdventureSummaryModal({
  summary,
  onClose,
  onStartNew,
}: {
  summary: AdventureCompletionSummary;
  /** «Домой» — закрыть итоги и остаться на хабе. */
  onClose: () => void;
  /** «Новая работа» — закрыть итоги и сразу открыть планирование. */
  onStartNew: () => void;
}) {
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useFeedback();
  const petType = usePreferencesStore((s) => s.petType);
  const skinVariant = usePetStore((s) => s.equippedSkinVariant);
  const styles = createAdventureSummaryModalStyles({ theme });

  const { adventure } = summary;
  const planKept = isPlanBonusEligible(adventure);
  // Золотой «Успех» — контрастный оттенок для светлой и тёмной темы.
  const chipColor = planKept ? colorPalettes.amber[isDark ? 400 : 700] : theme.textSecondary;
  const transferred = summary.toWallet + summary.toBank + summary.bankBonus;

  // Как в макете: «15 на хотения, 30 на цель» (+ бонус копилки за новые деньги).
  const transferSplit = [
    `${summary.toWallet} на хотения`,
    `${summary.toBank} на цель`,
    ...(summary.bankBonus > 0 ? [`+${summary.bankBonus} бонус копилки`] : []),
  ].join(', ');
  // Опыта смена не даёт — его (и новый уровень) приносит урок, см. экран награды урока.
  const rewardsLine = summary.bonusAwarded > 0 ? `бонус за план +${summary.bonusAwarded}` : null;

  const handleHome = () => {
    triggerHaptic('light');
    onClose();
  };
  const handleStartNew = () => {
    triggerHaptic('medium');
    onStartNew();
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.topRow}>
          <HelpButton screen="adventure_summary" />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Герой: результат одной фразой + питомец с наградой */}
          <Animated.View entering={FadeInDown.duration(350)}>
            <LinearGradient
              colors={[
                withAlpha(PLAN_CATEGORY_COLORS.need, 0.14),
                withAlpha(PLAN_CATEGORY_COLORS.need, 0.28),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={[styles.heroCircle, { width: scale(96), height: scale(96) }]} />
              <View style={styles.heroText}>
                <View style={styles.heroChip}>
                  <Ionicons
                    name={planKept ? 'trophy' : 'clipboard-outline'}
                    size={scale(16)}
                    color={chipColor}
                  />
                  <Text
                    style={[styles.heroChipText, { color: chipColor, fontSize: scaledFont('md') }]}
                  >
                    {planKept ? 'Успех' : 'Итоги'}
                  </Text>
                </View>
                <Text style={[styles.heroTitle, { fontSize: scaledFont('xxl') }]}>
                  {planKept ? 'Отличная работа!' : 'Смена завершена'}
                </Text>
                <Text style={[styles.heroSubtitle, { fontSize: scaledFont('md') }]}>
                  {planKept
                    ? 'Финни гордится тобой'
                    : 'Потрачено больше плана — в следующий раз получится точнее'}
                </Text>
              </View>
              <PetAvatarBubble
                petType={petType}
                emotion="reward"
                skinVariant={skinVariant}
                size={112}
              />
            </LinearGradient>
          </Animated.View>

          {(summary.autoCompleted || summary.completionRatio < 1) && (
            <Text style={[styles.note, { fontSize: scaledFont('md') }]}>
              {summary.autoCompleted ? '24 часа смены вышли. ' : ''}
              {summary.completionRatio < 1
                ? `Урок пройден на ${Math.round(summary.completionRatio * 100)}% — столько же бюджета, бонус копилки не начислялся.`
                : 'Вот что получилось.'}
            </Text>
          )}
          {/* Урок не закончен — прогресс сохранён, следующая смена продолжит его. */}
          {summary.lesson && !summary.lesson.finished && (
            <Text style={[styles.note, { fontSize: scaledFont('md') }]}>
              Урок «{summary.lesson.title}» продолжишь в следующую смену — с этапа{' '}
              {Math.min(summary.lesson.nodesDone + 1, summary.lesson.nodesTotal)} из{' '}
              {summary.lesson.nodesTotal}.
            </Text>
          )}

          {/* План и факт (§7.4) */}
          <AdventurePlanFactCard
            adventure={adventure}
            tag="Смена закрыта"
            savingsFact={summary.toBank}
          />

          {/* Куда ушёл бюджет смены: остаток — в «Хочу», «Коплю» — на цель */}
          <AdventureAmountCard
            icon={
              <Image
                source={FURNITURE_ASSETS.piggybank[0]}
                style={{ width: scale(36), height: scale(30) }}
                contentFit="contain"
              />
            }
            iconBackground={withAlpha(PLAN_CATEGORY_COLORS.save, 0.2)}
            title="Перенос в копилку:"
            amount={transferred}
            lines={rewardsLine ? [transferSplit, rewardsLine] : [transferSplit]}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + scale(12) }]}>
          <TouchableOpacity
            onPress={handleHome}
            activeOpacity={0.85}
            style={styles.primaryButton}
            accessibilityRole="button"
          >
            <Text style={[styles.primaryButtonText, { fontSize: scaledFont('lg') }]}>Домой</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleStartNew}
            activeOpacity={0.85}
            style={styles.secondaryButton}
            accessibilityRole="button"
          >
            <Text style={[styles.secondaryButtonText, { fontSize: scaledFont('lg') }]}>
              Новая работа
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
