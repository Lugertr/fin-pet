// src/components/adventure/AdventureSummaryModal/AdventureSummaryModal.tsx
// Итоги завершённого приключения (макет «Итоги работы», 27.09.2026) —
// полноэкранное окно на хабе и после ручного завершения, и после
// автоматического (время вышло, см. adventureStore.completeIfExpired).
// Сверху — карточка-герой с питомцем, ниже «План и факт», перенос в банк и в
// кошелёк, награды; внизу — «Домой» и «Новое приключение». Данные — снимок
// AdventureCompletionSummary, награды к этому моменту уже начислены.
// Ошибка не наказывается (§8): если трат больше плана — нейтральный тон.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetSprite } from '@/components/pet';
import { HelpButton } from '@/components/shared';
import { PLAN_CATEGORY_COLORS } from '@/constants/planCategories';
import { actualSpend, isPlanBonusEligible, plannedSpend } from '@/domain/adventure/Adventure';
import { getLevelTitle } from '@/domain/player/PlayerLevel';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES } from '@/lib/hooks/useLessons';
import type { AdventureCompletionSummary } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { createAdventureSummaryModalStyles } from './AdventureSummaryModal.styles';

/** Доля для полоски (0–100); больше плана — полная полоска. */
function percentOf(value: number, total: number): number {
  if (total <= 0) return value > 0 ? 100 : 0;
  return Math.min(100, Math.round((value / total) * 100));
}

export function AdventureSummaryModal({
  summary,
  onClose,
  onStartNew,
}: {
  summary: AdventureCompletionSummary;
  /** «Домой» — закрыть итоги и остаться на хабе. */
  onClose: () => void;
  /** «Новое приключение» — закрыть итоги и сразу открыть планирование. */
  onStartNew: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useFeedback();
  const petType = usePreferencesStore((s) => s.petType);
  const skinVariant = usePetStore((s) => s.equippedSkinVariant);
  const styles = createAdventureSummaryModalStyles({ theme });

  const { adventure } = summary;
  const planKept = isPlanBonusEligible(adventure);
  const spendPlan = plannedSpend(adventure);
  const spendFact = actualSpend(adventure);
  const overspend = Math.max(0, spendFact - spendPlan);
  const branchName = BRANCHES.find((b) => b.id === adventure.branchId)?.name;

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
          {/* Герой: результат одной фразой + питомец */}
          <Animated.View entering={FadeInDown.duration(350)}>
            <LinearGradient
              colors={[
                withAlpha(PLAN_CATEGORY_COLORS.need, 0.16),
                withAlpha(PLAN_CATEGORY_COLORS.need, 0.3),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroText}>
                <View style={styles.heroChip}>
                  <Text style={[styles.heroChipText, { fontSize: scaledFont('sm') }]}>
                    {planKept ? '🏆 Успех' : '📋 Итоги'}
                  </Text>
                </View>
                <Text style={[styles.heroTitle, { fontSize: scaledFont('xxl') }]}>
                  {planKept ? 'Отличная работа!' : 'Приключение завершено'}
                </Text>
                <Text style={[styles.heroSubtitle, { fontSize: scaledFont('md') }]}>
                  {planKept
                    ? 'Финни гордится тобой'
                    : 'Потрачено больше плана — в следующий раз получится точнее'}
                </Text>
              </View>
              <PetSprite
                petType={petType}
                mood={100}
                skinVariant={skinVariant}
                height={scale(120)}
              />
            </LinearGradient>
          </Animated.View>

          {(summary.autoCompleted || summary.completionRatio < 1) && (
            <Text style={[styles.note, { fontSize: scaledFont('sm') }]}>
              {summary.autoCompleted
                ? 'Время приключения вышло — вот что получилось.'
                : `Завершено досрочно: получено ${Math.round(summary.completionRatio * 100)}% бюджета и опыта, бонус банка не начислялся.`}
            </Text>
          )}

          {summary.levelUp && (
            <Animated.View entering={ZoomIn.duration(400)} style={styles.levelUpCard}>
              <Text style={{ fontSize: scale(32) }}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelUpTitle, { fontSize: scaledFont('lg') }]}>
                  Новый уровень {summary.levelUp.to}: «{getLevelTitle(summary.levelUp.to)}»
                </Text>
                {/* §8.4: объясняем, что именно получено — только реально выданное */}
                {summary.levelUp.coins > 0 && (
                  <Text style={[styles.levelUpText, { fontSize: scaledFont('sm') }]}>
                    Награда: +{formatPrice(summary.levelUp.coins)}
                  </Text>
                )}
                {summary.levelUp.skinName && (
                  <Text style={[styles.levelUpText, { fontSize: scaledFont('sm') }]}>
                    Новый облик питомца: {summary.levelUp.skinName}
                  </Text>
                )}
              </View>
            </Animated.View>
          )}

          {/* План и факт (§7.4) */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { fontSize: scaledFont('xl') }]}>План и факт</Text>
              <View style={styles.tag}>
                <Text style={[styles.tagText, { fontSize: scaledFont('xs') }]}>
                  Приключение №{adventure.adventureNumber}
                </Text>
              </View>
            </View>
            {branchName && (
              <Text style={[styles.cardSubtitle, { fontSize: scaledFont('sm') }]}>
                Тема: {branchName}
              </Text>
            )}

            <View
              style={styles.planRow}
              accessible
              accessibilityLabel={`Потратить: план ${formatCoins(spendPlan)}, факт ${formatCoins(spendFact)}`}
            >
              <View style={styles.planRowHeader}>
                <View style={[styles.dot, { backgroundColor: PLAN_CATEGORY_COLORS.spend }]} />
                <Text style={[styles.planLabel, { fontSize: scaledFont('lg') }]}>Потратить</Text>
                <Text style={[styles.planValues, { fontSize: scaledFont('sm') }]}>
                  план {spendPlan} · факт{' '}
                  <Text style={styles.planFact}>{formatPrice(spendFact)}</Text>
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${percentOf(spendFact, spendPlan)}%`,
                      backgroundColor: PLAN_CATEGORY_COLORS.spend,
                    },
                  ]}
                />
              </View>
              {/* Надо / хочу не планируются — видны только в факте трат событий */}
              <View style={styles.splitRow}>
                <View style={styles.splitItem}>
                  <View style={[styles.dotSmall, { backgroundColor: PLAN_CATEGORY_COLORS.need }]} />
                  <Text style={[styles.splitText, { fontSize: scaledFont('sm') }]}>
                    нужное {formatPrice(adventure.fact.mandatory)}
                  </Text>
                </View>
                <View style={styles.splitItem}>
                  <View style={[styles.dotSmall, { backgroundColor: PLAN_CATEGORY_COLORS.want }]} />
                  <Text style={[styles.splitText, { fontSize: scaledFont('sm') }]}>
                    желаемое {formatPrice(adventure.fact.optional)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.statusText, { fontSize: scaledFont('sm') }]}>
                {overspend > 0
                  ? `Больше плана на ${formatPrice(overspend)}`
                  : `✓ В плане${summary.bonusAwarded > 0 ? ` — бонус +${formatPrice(summary.bonusAwarded)}` : ''}`}
              </Text>
            </View>

            <View
              style={styles.planRow}
              accessible
              accessibilityLabel={`Коплю: план ${formatCoins(adventure.plan.savings)}, в банк ${formatCoins(summary.toBank)}`}
            >
              <View style={styles.planRowHeader}>
                <View style={[styles.dot, { backgroundColor: PLAN_CATEGORY_COLORS.save }]} />
                <Text style={[styles.planLabel, { fontSize: scaledFont('lg') }]}>Коплю</Text>
                <Text style={[styles.planValues, { fontSize: scaledFont('sm') }]}>
                  план {adventure.plan.savings} · факт{' '}
                  <Text style={styles.planFact}>{formatPrice(summary.toBank)}</Text>
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${percentOf(summary.toBank, adventure.plan.savings)}%`,
                      backgroundColor: PLAN_CATEGORY_COLORS.save,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Куда ушёл остаток бюджета приключения */}
          <View style={styles.transferCard}>
            <View
              style={[
                styles.transferIcon,
                { backgroundColor: withAlpha(PLAN_CATEGORY_COLORS.save, 0.2) },
              ]}
            >
              <Text style={{ fontSize: scale(24) }}>🐷</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.transferTitleRow}>
                <Text style={[styles.transferTitle, { fontSize: scaledFont('lg') }]}>
                  Перенос в банк:
                </Text>
                <View style={styles.amountChip}>
                  <Text style={[styles.amountChipText, { fontSize: scaledFont('md') }]}>
                    {formatPrice(summary.toBank + summary.bankBonus)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.transferText, { fontSize: scaledFont('sm') }]}>
                {summary.bankBonus > 0
                  ? `${summary.toBank} из «Коплю» + ${summary.bankBonus} бонус банка`
                  : 'всё отложенное в «Коплю» — на твою цель'}
              </Text>
            </View>
          </View>

          <View style={styles.transferCard}>
            <View
              style={[styles.transferIcon, { backgroundColor: withAlpha(theme.primary, 0.15) }]}
            >
              <Ionicons name="wallet-outline" size={scale(24)} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.transferTitleRow}>
                <Text style={[styles.transferTitle, { fontSize: scaledFont('lg') }]}>
                  В кошелёк:
                </Text>
                <View style={styles.amountChip}>
                  <Text style={[styles.amountChipText, { fontSize: scaledFont('md') }]}>
                    {formatPrice(summary.toWallet)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.transferText, { fontSize: scaledFont('sm') }]}>
                остаток бюджета приключения · опыт +{summary.xpAwarded}
              </Text>
            </View>
          </View>
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
              Новое приключение
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
