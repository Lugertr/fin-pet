// src/components/lesson/LessonEventStep/LessonEventStep.tsx
// Событие внутри урока (решение пользователя 28.09.2026): выбор по ситуации
// урока, не по времени. Платит бюджет смены — если это урок смены; иначе
// выбор без денег (урок вне смены).
// Вид — окно по макету (29.09.2026): плашка «Событие», иконка (эмодзи,
// персонаж question/reward или картинка — constants/eventIcons.ts), заголовок,
// текст, варианты; внизу — как главный (первый) вариант ляжет на план смены.
// Платный вариант, на который не хватает бюджета, неактивен и подписан
// текстом (§12.3 — без частичной оплаты; §23 — смысл не только цветом). Так
// же — вариант «за энергию», когда энергии не хватает (решение 29.09.2026);
// если недоступно всё — подсказка, что делать.

import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { PetAvatarBubble } from '@/components/pet';
import { resolveEventIcon } from '@/constants/eventIcons';
import { PLAN_CATEGORY_COLORS, planCategoryTextColor } from '@/constants/planCategories';
import {
  AdventureRecord,
  canAfford,
  canAffordEnergy,
  previewEventChoice,
} from '@/domain/adventure/Adventure';
import { LessonEventContent, LessonEventOptionContent } from '@/domain/content/LessonContent';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { formatCoins, formatNumber, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { emojiSizes } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';
import { createLessonEventStepStyles } from './LessonEventStep.styles';

const ICON_SIZE = 96;

function EventIconView({ icon }: { icon: string }) {
  const { scale } = useResponsive();
  const petType = usePreferencesStore((s) => s.petType);
  const skinVariant = usePetStore((s) => s.equippedSkinVariant);
  const resolved = resolveEventIcon(icon);

  if (resolved.kind === 'pet') {
    return (
      <PetAvatarBubble
        petType={petType}
        emotion={resolved.emotion}
        skinVariant={skinVariant}
        size={ICON_SIZE}
      />
    );
  }
  if (resolved.kind === 'image') {
    return (
      <Image
        source={resolved.source}
        style={{ width: scale(ICON_SIZE), height: scale(ICON_SIZE) }}
        contentFit="contain"
        accessibilityIgnoresInvertColors
      />
    );
  }
  return <Text style={{ fontSize: scale(emojiSizes.xl) }}>{resolved.text}</Text>;
}

/** Подпись кнопки: действие и его цена из данных — цифра совпадает с тем, что спишется. */
function optionCaption(option: LessonEventOptionContent, showEnergy: boolean) {
  const parts = [option.label];
  const a11y = [option.label];
  if (option.coinAmount < 0) {
    parts.push(formatPrice(-option.coinAmount));
    a11y.push(`стоит ${formatCoins(-option.coinAmount)}`);
  } else if (option.coinAmount > 0) {
    parts.push(`+${formatPrice(option.coinAmount)}`);
    a11y.push(`принесёт ${formatCoins(option.coinAmount)}`);
  }
  // Энергия вместо денег (content/lessons: energyCost) — только в смене.
  if (showEnergy && (option.energyCost ?? 0) > 0) {
    parts.push(`${option.energyCost}⚡`);
    a11y.push(`стоит ${option.energyCost} энергии`);
  }
  return { text: parts.join(' · '), a11y: a11y.join(', ') };
}

export function LessonEventStep({
  event,
  adventure,
  showEnergy = false,
  coffeeAvailable = false,
  onChoose,
}: {
  event: LessonEventContent;
  /** Активная смена; null — урок вне смены, деньги не двигаются. */
  adventure: AdventureRecord | null;
  /** Урок смены — у варианта видна его цена в энергии (energyCost), и её должно хватать. */
  showEnergy?: boolean;
  /** Кофе в этой смене уже открыт и не выпит — подсказать его, когда недоступно всё. */
  coffeeAvailable?: boolean;
  /** Выбор; false — не засчитан (кнопки снова доступны). */
  onChoose: (optionId: string) => Promise<boolean> | void;
}) {
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const energy = usePetStore((s) => s.currentMood);
  const stepStyles = createLessonStepsStyles({ theme });
  const styles = createLessonEventStepStyles({ theme });
  // Выбор применяется асинхронно (запись бюджета) — повторный тап до его
  // окончания списал бы деньги дважды.
  const [submittedOptionId, setSubmittedOptionId] = useState<string | null>(null);

  // Энергия копится по времени — пересчёт при открытии события.
  useEffect(() => {
    usePetStore.getState().refreshMood();
  }, []);

  const budget = adventure?.budget ?? null;
  const affordable = (coinAmount: number) => budget === null || canAfford(coinAmount, budget);
  const energyOk = (option: LessonEventOptionContent) =>
    !showEnergy || canAffordEnergy(option.energyCost, energy);
  const allBlocked = event.options.every(
    (option) => !affordable(option.coinAmount) || !energyOk(option)
  );

  const handleChoose = async (optionId: string) => {
    if (submittedOptionId) return;
    const option = event.options.find((o) => o.id === optionId);
    if (!option || !affordable(option.coinAmount) || !energyOk(option)) return;
    setSubmittedOptionId(optionId);
    triggerHaptic('medium');
    if ((await onChoose(optionId)) === false) setSubmittedOptionId(null);
  };

  const main = event.options[0];
  const inRow = event.options.length === 2;

  const renderPreview = () => {
    if (!adventure || !main) {
      return (
        <Text style={[styles.previewNote, { fontSize: scaledFont('md') }]}>
          Урок идёт не в смене — бюджет не изменится.
        </Text>
      );
    }
    const preview = previewEventChoice(adventure, main);
    const energyCost = showEnergy ? (main.energyCost ?? 0) : 0;
    const budgetChanges = preview.budgetAfter !== preview.budgetBefore;
    const categoryKey = preview.category === 'mandatory' ? 'need' : 'want';
    const categoryColor = PLAN_CATEGORY_COLORS[categoryKey];
    const barBase = Math.max(preview.spendPlan, preview.spendAfter, 1);
    const pct = (value: number): `${number}%` =>
      `${Math.round((Math.min(value, barBase) / barBase) * 100)}%`;

    return (
      <>
        {/* «Это» — главный вариант: он выделен цветом и назван для скринридера. */}
        <Text
          style={[styles.previewTitle, { fontSize: scaledFont('sm') }]}
          accessibilityLabel={`Как «${main.label}» ляжет на план смены`}
        >
          Как это ляжет на план смены
        </Text>

        <View
          style={styles.previewRow}
          accessible
          accessibilityLabel={
            budgetChanges
              ? `Бюджет смены: было ${formatCoins(preview.budgetBefore)}, станет ${formatCoins(preview.budgetAfter)}`
              : `Бюджет смены не изменится: ${formatCoins(preview.budgetBefore)}`
          }
        >
          <View style={styles.previewLabelRow}>
            <View style={[styles.dot, { backgroundColor: theme.coins }]} />
            <Text style={[styles.previewLabel, { fontSize: scaledFont('md') }]}>Бюджет</Text>
          </View>
          <Text style={[styles.previewValue, { fontSize: scaledFont('lg') }]}>
            {budgetChanges
              ? `${formatNumber(preview.budgetBefore)} → ${formatPrice(preview.budgetAfter)}`
              : `${formatPrice(preview.budgetBefore)} · не изменится`}
          </Text>
        </View>

        {preview.category && (
          <View
            accessible
            accessibilityLabel={`${preview.category === 'mandatory' ? 'Нужно' : 'Хочу'}: факт ${formatCoins(preview.factBefore)}, станет ${formatCoins(preview.factAfter)}. Потратить: ${formatNumber(preview.spendAfter)} из ${formatCoins(preview.spendPlan)} по плану`}
          >
            <View style={styles.previewRow}>
              <View style={styles.previewLabelRow}>
                <View style={[styles.dot, { backgroundColor: categoryColor }]} />
                <Text style={[styles.previewLabel, { fontSize: scaledFont('md') }]}>
                  {preview.category === 'mandatory' ? 'Нужно' : 'Хочу'}
                </Text>
              </View>
              <View style={styles.previewLabelRow}>
                <View
                  style={[styles.deltaChip, { backgroundColor: withAlpha(categoryColor, 0.16) }]}
                >
                  <Text
                    style={[
                      styles.deltaText,
                      {
                        color: planCategoryTextColor(categoryKey, isDark),
                        fontSize: scaledFont('sm'),
                      },
                    ]}
                  >
                    +{formatPrice(preview.cost)}
                  </Text>
                </View>
                <Text style={[styles.previewHint, { fontSize: scaledFont('sm') }]}>
                  факт {formatNumber(preview.factBefore)} → {formatPrice(preview.factAfter)}
                </Text>
              </View>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: pct(preview.spendBefore), backgroundColor: categoryColor },
                ]}
              />
              <View
                style={[
                  styles.barFill,
                  {
                    width: pct(preview.spendAfter - preview.spendBefore),
                    backgroundColor: withAlpha(categoryColor, 0.45),
                  },
                ]}
              />
            </View>
            <Text style={[styles.previewHint, { fontSize: scaledFont('sm') }]}>
              Потратить: {formatNumber(preview.spendAfter)} из {formatPrice(preview.spendPlan)} по
              плану
            </Text>
          </View>
        )}

        {energyCost > 0 && (
          <View
            style={styles.previewRow}
            accessible
            accessibilityLabel={`Энергия: было ${energy}, станет ${Math.max(0, energy - energyCost)}`}
          >
            <View style={styles.previewLabelRow}>
              <Text style={{ fontSize: scaledFont('md') }}>⚡</Text>
              <Text style={[styles.previewLabel, { fontSize: scaledFont('md') }]}>Энергия</Text>
            </View>
            <Text style={[styles.previewValue, { fontSize: scaledFont('lg') }]}>
              {energy} → {Math.max(0, energy - energyCost)}⚡
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={[stepStyles.stepContainer, styles.backdrop]}>
      <ScrollView
        contentContainerStyle={styles.backdropContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { fontSize: scaledFont('sm') }]}>Событие</Text>
          </View>

          <View style={styles.iconBox}>
            <EventIconView icon={event.icon} />
          </View>

          <Text style={[styles.title, { fontSize: scaledFont('xl') }]} accessibilityRole="header">
            {event.title}
          </Text>
          <Text style={[styles.description, { fontSize: scaledFont('md') }]}>
            {event.description}
          </Text>

          <View style={[styles.options, inRow && styles.optionsRow]}>
            {event.options.map((option, index) => {
              const canPay = affordable(option.coinAmount);
              const hasEnergy = energyOk(option);
              const available = canPay && hasEnergy;
              const disabled = submittedOptionId !== null || !available;
              const isMain = index === 0;
              const caption = optionCaption(option, showEnergy);
              // Чего не хватает — текстом под подписью (§23: не только цветом).
              const shortage = !canPay
                ? `Не хватает ${formatPrice(-option.coinAmount - (budget ?? 0))}`
                : !hasEnergy
                  ? `Не хватает энергии: нужно ${option.energyCost}⚡`
                  : null;
              const shortageA11y = !canPay
                ? `Не хватает ${formatCoins(-option.coinAmount - (budget ?? 0))}`
                : !hasEnergy
                  ? `Не хватает энергии: нужно ${option.energyCost}`
                  : null;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => void handleChoose(option.id)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={
                    shortageA11y ? `${caption.a11y}. ${shortageA11y}` : caption.a11y
                  }
                  accessibilityState={{ disabled }}
                  activeOpacity={0.8}
                  style={[
                    styles.optionButton,
                    isMain ? styles.optionMain : styles.optionSecondary,
                    inRow && styles.optionInRow,
                    { paddingVertical: scale(12) },
                    ((submittedOptionId !== null && submittedOptionId !== option.id) ||
                      !available) &&
                      styles.optionButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isMain ? styles.optionLabelMain : styles.optionLabelSecondary,
                      { fontSize: scaledFont('lg') },
                    ]}
                  >
                    {caption.text}
                  </Text>
                  {shortage && (
                    <Text
                      style={[
                        styles.optionHint,
                        isMain && styles.optionLabelMain,
                        { fontSize: scaledFont('sm') },
                      ]}
                    >
                      {shortage}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {allBlocked && (
            <Text style={[styles.previewNote, { fontSize: scaledFont('md') }]}>
              {coffeeAvailable
                ? 'Сейчас не хватает ни монет, ни энергии. Выйди из урока и подожди, пока энергия восстановится, — или выпей кофе на экране смены.'
                : 'Сейчас не хватает ни монет, ни энергии. Выйди из урока и подожди, пока энергия восстановится.'}
            </Text>
          )}

          <View style={styles.preview}>{renderPreview()}</View>
        </View>
      </ScrollView>
    </View>
  );
}
