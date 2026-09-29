// src/components/onboarding/OnboardingRoomTour/OnboardingRoomTour.tsx
// Тур по комнате в онбординге (макеты «Онбординг-тур», 27.09.2026) — идёт до
// стартового капитала. Сцена — главный экран таким, каким он будет в игре
// (шапка, комната с выбранным питомцем, нижние вкладки), затемнена; светлым
// остаётся только то, о чём рассказывает шаг, а снизу поверх сцены —
// карточка с пояснением:
//   money      — шапка: кошелёк «C», энергия, профиль;
//   navigation — «Начать приключение» (над карточкой) и нижние вкладки;
//   goals      — комната с выносками бонусов кровати, копилки и ноутбука
//                (реальные числа из каталога, не выдуманные).
// Сцена — только картинка: нажатия внутри неё отключены.

import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from '@/components/ui/Text';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetRoom } from '@/components/pet';
import { AppHeaderStats } from '@/components/shared';
import { MAIN_TABS } from '@/constants/mainTabs';
import type { PetType } from '@/constants/petAssets';
import { STARTING_WALLET_BALANCE } from '@/domain/profile/Profile';
import { getRoomLayout, ROOM_ASPECT_RATIO, RoomBox } from '@/domain/room/RoomLayout';
import { SHOP_CATALOG } from '@/lib/hooks/useShop';
import type { IconName } from '@/types/icons';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes } from '@/theme/tokens';
import { createOnboardingRoomTourStyles } from './OnboardingRoomTour.styles';

export type RoomTourStage = 'money' | 'navigation' | 'goals';

/** Потолок ширины комнаты — как в PetRoom. */
const ROOM_MAX_WIDTH = 460;
/**
 * Какая доля высоты комнаты должна поместиться над карточкой: вещи с бонусами
 * стоят до ~65% высоты (RoomLayout), плюс их выноски.
 */
const ROOM_VISIBLE_SHARE = 0.72;

/** Номера на вкладках в шаге «Куда нажимать» (1 — кнопка приключения). */
const TAB_BADGES: Partial<Record<string, number>> = {
  lessons: 2,
  savings: 3,
  shop: 4,
  profile: 5,
};

const NAVIGATION_ITEMS = [
  { label: 'Начать смену', text: 'главный цикл: план бюджета, урок, итоги и монеты в копилку' },
  { label: 'Уроки', text: 'темы и карта знаний' },
  { label: 'Копилка', text: 'банк: накопления и цель, на которую копишь' },
  { label: 'Магазин', text: 'еда, мебель и декор для комнаты' },
  { label: 'Прогресс', text: 'уровень, достижения и настройки' },
];

/** Лучший бонус вещей категории в магазине — реальные числа из content/items.json. */
function maxBonus(
  category: string,
  field: 'energy_max_bonus' | 'savings_bonus_rate' | 'coin_bonus_percent'
) {
  return Math.max(
    0,
    ...SHOP_CATALOG.filter((item) => item.category === category).map((item) => item[field] ?? 0)
  );
}

interface Goal {
  key: 'bed' | 'piggybank' | 'laptop';
  icon: IconName;
  color: string;
  name: string;
  bonus: string;
  /** Длина линии от выноски до вещи — разная, чтобы выноски не налезали друг на друга. */
  lineLength: number;
}

/** Верхняя середина места вещи в комнате (в долях 0–1). */
function anchorOf(box: RoomBox): { x: number; y: number } {
  const x =
    box.left !== undefined ? box.left + box.width / 2 : 100 - (box.right ?? 0) - box.width / 2;
  const y = box.top ?? 100 - (box.bottom ?? 0);
  return { x: x / 100, y: y / 100 };
}

export function OnboardingRoomTour({
  stage,
  stepNumber,
  totalSteps,
  petType,
  petName,
  skinVariant,
  onNext,
  onSkip,
}: {
  stage: RoomTourStage;
  stepNumber: number;
  totalSteps: number;
  petType: PetType;
  petName: string;
  skinVariant: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const insets = useSafeAreaInsets();
  const styles = createOnboardingRoomTourStyles({ theme });

  const [containerHeight, setContainerHeight] = useState(0);
  const [roomRegion, setRoomRegion] = useState({ y: 0, width: 0 });
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);

  // Карточка лежит поверх сцены: в «Куда нажимать» — над вкладками (их видно),
  // в остальных шагах — у самого низа.
  const sheetBottom = stage === 'navigation' ? tabBarHeight : 0;
  const sheetTop = containerHeight - sheetBottom - sheetHeight;
  // Комната вписывается так, чтобы вещи с бонусами были видны над карточкой.
  const visibleHeight = sheetHeight > 0 ? sheetTop - roomRegion.y : 0;
  const roomWidth = Math.max(
    0,
    Math.min(
      roomRegion.width,
      ROOM_MAX_WIDTH,
      visibleHeight > 0
        ? (visibleHeight / ROOM_VISIBLE_SHARE) * ROOM_ASPECT_RATIO
        : roomRegion.width
    )
  );
  const roomHeight = roomWidth / ROOM_ASPECT_RATIO;
  const roomLeft = (roomRegion.width - roomWidth) / 2;

  const goals: Goal[] = [
    {
      key: 'bed',
      icon: 'bed-outline',
      color: colorPalettes.amber[500],
      name: 'Кровать',
      bonus: `до +${maxBonus('bed', 'energy_max_bonus')}⚡`,
      lineLength: scale(18),
    },
    {
      key: 'piggybank',
      icon: 'wallet-outline',
      color: colorPalettes.emerald[500],
      name: 'Копилка',
      bonus: `до +${maxBonus('piggybank', 'savings_bonus_rate')}% в банке`,
      lineLength: scale(14),
    },
    {
      key: 'laptop',
      icon: 'laptop-outline',
      color: colorPalettes.indigo[500],
      name: 'Ноутбук',
      bonus: `до +${maxBonus('laptop', 'coin_bonus_percent')}% за уроки`,
      lineLength: scale(40),
    },
  ];
  const layout = getRoomLayout(0);
  const calloutWidth = scale(136);
  const calloutHeight = scale(28);

  const renderBadge = (n: number) => (
    <View style={styles.badge}>
      <Text style={[styles.badgeText, { fontSize: scaledFont('xs') }]}>{n}</Text>
    </View>
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      {/* ── Сцена (затемнена, кроме объясняемой части) ── */}
      <View style={[styles.chipRow, { paddingTop: insets.top + scale(8) }]}>
        <View pointerEvents="none" style={styles.dim} />
        <View style={styles.stepChip}>
          <View style={styles.stepChipDot} />
          <Text style={[styles.stepChipText, { fontSize: scaledFont('sm') }]}>
            Шаг {stepNumber} из {totalSteps}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onSkip}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Пропустить знакомство с комнатой"
        >
          <Text style={[styles.skipText, { fontSize: scaledFont('md') }]}>Пропустить</Text>
        </TouchableOpacity>
      </View>

      {stage !== 'goals' && (
        <Spot
          highlighted={stage === 'money'}
          style={stage === 'money' ? styles.headerCard : styles.headerPlain}
          dimStyle={styles.dim}
        >
          <AppHeaderStats energy={100} coins={STARTING_WALLET_BALANCE} />
        </Spot>
      )}

      <Spot
        highlighted={stage === 'goals'}
        style={styles.roomSpot}
        innerStyle={styles.roomInner}
        dimStyle={styles.dim}
        onLayout={(e) =>
          setRoomRegion({ y: e.nativeEvent.layout.y, width: e.nativeEvent.layout.width })
        }
      >
        {roomWidth > 0 && (
          <View style={[styles.roomBox, { left: roomLeft, width: roomWidth, height: roomHeight }]}>
            <PetRoom
              petType={petType}
              petName={petName}
              skinVariant={skinVariant}
              mood={100}
              showLabels={stage !== 'goals'}
            />
            {stage === 'goals' &&
              goals.map((goal) => {
                const anchor = anchorOf(layout[goal.key]);
                const ax = anchor.x * roomWidth;
                const ay = anchor.y * roomHeight;
                const pillTop = ay - goal.lineLength - calloutHeight;
                const pillLeft = Math.min(
                  Math.max(ax - calloutWidth / 2, 4),
                  roomWidth - calloutWidth - 4
                );
                return (
                  <View key={goal.key} style={styles.calloutLayer}>
                    <View
                      style={[
                        styles.calloutPill,
                        {
                          left: pillLeft,
                          top: pillTop,
                          width: calloutWidth,
                          height: calloutHeight,
                          borderColor: goal.color,
                        },
                      ]}
                    >
                      <Ionicons name={goal.icon} size={scale(13)} color={goal.color} />
                      <Text
                        style={[styles.calloutText, { fontSize: scaledFont('xxs') }]}
                        numberOfLines={1}
                      >
                        {goal.name} · {goal.bonus}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.calloutLine,
                        {
                          left: ax - 1,
                          top: pillTop + calloutHeight,
                          height: goal.lineLength,
                          backgroundColor: goal.color,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.calloutDot,
                        { left: ax - 5, top: ay - 5, borderColor: goal.color },
                      ]}
                    />
                  </View>
                );
              })}
          </View>
        )}
      </Spot>

      <Spot
        highlighted={stage === 'navigation'}
        style={[styles.tabBar, { paddingBottom: insets.bottom + scale(6) }]}
        dimStyle={styles.dim}
        onLayout={(e) => setTabBarHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.tabRow}>
          {MAIN_TABS.map((tab) => {
            const badge = stage === 'navigation' ? TAB_BADGES[tab.name] : undefined;
            const isHub = tab.name === 'index';
            return (
              <View
                key={tab.name}
                style={[styles.tabItem, badge !== undefined && styles.tabItemMarked]}
              >
                <Ionicons
                  name={tab.icon}
                  size={scale(22)}
                  color={isHub || badge !== undefined ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { fontSize: scaledFont('xxs') },
                    (isHub || badge !== undefined) && { color: theme.primary },
                  ]}
                  numberOfLines={1}
                >
                  {tab.title}
                </Text>
                {badge !== undefined && renderBadge(badge)}
              </View>
            );
          })}
        </View>
      </Spot>

      {/* ── «Начать приключение» над карточкой (шаг «Куда нажимать») ── */}
      {stage === 'navigation' && sheetHeight > 0 && (
        <View
          pointerEvents="none"
          style={[styles.floatingCta, { bottom: sheetBottom + sheetHeight + scale(12) }]}
        >
          <View style={styles.ctaButton}>
            <Ionicons name="briefcase-outline" size={scale(18)} color={theme.onGradient} />
            <Text style={[styles.ctaText, { fontSize: scaledFont('lg') }]}>Начать смену</Text>
            <Ionicons name="chevron-forward" size={scale(16)} color={theme.onGradient} />
          </View>
          {renderBadge(1)}
        </View>
      )}

      {/* ── Карточка с пояснением ── */}
      <Animated.View
        key={stage}
        entering={FadeIn.duration(250)}
        style={[
          styles.sheet,
          {
            bottom: sheetBottom,
            paddingBottom: (stage === 'navigation' ? 0 : insets.bottom) + scale(16),
          },
        ]}
        onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
      >
        {stage !== 'navigation' && <View style={styles.sheetHandle} />}
        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.sheetTitleRow}>
            <Text style={[styles.sheetTitle, { fontSize: scaledFont('xxl') }]}>
              {stage === 'money'
                ? 'Твои деньги и энергия'
                : stage === 'navigation'
                  ? 'Куда нажимать'
                  : 'Цели и их бонусы'}
            </Text>
            {stage === 'goals' && (
              <View style={styles.finalChip}>
                <Text style={[styles.finalChipText, { fontSize: scaledFont('xxs') }]}>
                  ★ ФИНАЛ ТУРА
                </Text>
              </View>
            )}
          </View>

          {stage === 'money' && (
            <>
              <View style={styles.list}>
                <InfoRow
                  styles={styles}
                  icon="wallet-outline"
                  color={theme.primary}
                  lead="твой кошелёк:"
                  text="монеты «C», которые можно тратить. Три цвета полоски — надо, хочу и коплю: так делится бюджет смены"
                />
                <InfoRow
                  styles={styles}
                  icon="flash"
                  color={theme.warning}
                  lead="энергия"
                  text="тратится на Аркаду, вопросы помощнику и ошибки в заданиях, а потом сама восстанавливается"
                />
                <InfoRow
                  styles={styles}
                  icon="person"
                  color={theme.textPrimary}
                  lead="профиль:"
                  text="твой уровень, достижения и настройки — во вкладке «Прогресс»"
                />
              </View>
              <Text style={[styles.footnote, { fontSize: scaledFont('sm') }]}>
                На каждом экране есть кнопка «?» — в ней подсказка
              </Text>
            </>
          )}

          {stage === 'navigation' && (
            <View style={styles.list}>
              {NAVIGATION_ITEMS.map((item, index) => (
                <View key={item.label} style={styles.numberRow}>
                  <View style={styles.numberCircle}>
                    <Text style={[styles.numberText, { fontSize: scaledFont('xs') }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.rowText, { fontSize: scaledFont('md') }]}>
                    <Text style={styles.rowLead}>{item.label}</Text> — {item.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {stage === 'goals' && (
            <>
              <View style={styles.goalsRow}>
                {goals.map((goal) => (
                  <View
                    key={goal.key}
                    style={[
                      styles.goalCard,
                      {
                        borderColor: withAlpha(goal.color, 0.45),
                        backgroundColor: withAlpha(goal.color, 0.06),
                      },
                    ]}
                  >
                    <View
                      style={[styles.goalIcon, { backgroundColor: withAlpha(goal.color, 0.15) }]}
                    >
                      <Ionicons name={goal.icon} size={scale(20)} color={goal.color} />
                    </View>
                    <Text style={[styles.goalName, { fontSize: scaledFont('md') }]}>
                      {goal.name}
                    </Text>
                    <View
                      style={[styles.goalBonus, { backgroundColor: withAlpha(goal.color, 0.18) }]}
                    >
                      <Text style={[styles.goalBonusText, { fontSize: scaledFont('xxs') }]}>
                        {goal.bonus}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.list}>
                <Bullet color={colorPalettes.amber[500]} styles={styles}>
                  это цели: копи на улучшения — бонусы вырастут
                </Bullet>
                <Bullet color={colorPalettes.indigo[500]} styles={styles}>
                  выбери цель в банке — он открывается копилкой
                </Bullet>
                <Bullet color={colorPalettes.emerald[500]} styles={styles}>
                  окно, ковёр и фон комнаты — для красоты, без бонусов
                </Bullet>
              </View>
              <Text style={[styles.footnote, { fontSize: scaledFont('sm') }]}>
                улучшения покупают на накопления: «Коплю» из каждой смены уходит в банк
              </Text>
            </>
          )}
        </ScrollView>

        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.85}
          style={styles.nextButton}
          accessibilityRole="button"
        >
          <Text style={[styles.nextText, { fontSize: scaledFont('lg') }]}>
            {stage === 'goals' ? 'Понятно, дальше' : 'Дальше'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

type TourStyles = ReturnType<typeof createOnboardingRoomTourStyles>;

function InfoRow({
  icon,
  color,
  lead,
  text,
  styles,
}: {
  icon: IconName;
  color: string;
  lead: string;
  text: string;
  styles: TourStyles;
}) {
  const { scale, scaledFont } = useResponsive();
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: withAlpha(color, 0.12) }]}>
        <Ionicons name={icon} size={scale(20)} color={color} />
      </View>
      <Text style={[styles.rowText, { fontSize: scaledFont('md') }]}>
        <Text style={styles.rowLead}>{lead}</Text> {text}
      </Text>
    </View>
  );
}

function Bullet({
  color,
  styles,
  children,
}: {
  color: string;
  styles: TourStyles;
  children: ReactNode;
}) {
  const { scaledFont } = useResponsive();
  return (
    <View style={styles.bullet}>
      <View style={[styles.bulletDot, { backgroundColor: color }]} />
      <Text style={[styles.rowText, { fontSize: scaledFont('md') }]}>{children}</Text>
    </View>
  );
}

/** Часть сцены: подсвеченная — как есть, остальные — под затемнением. */
function Spot({
  highlighted,
  style,
  innerStyle,
  dimStyle,
  onLayout,
  children,
}: {
  highlighted: boolean;
  style?: StyleProp<ViewStyle>;
  /** Для растягиваемой части (комната) — { flex: 1 }. */
  innerStyle?: StyleProp<ViewStyle>;
  dimStyle: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
  children: ReactNode;
}) {
  return (
    <View style={style} onLayout={onLayout}>
      <View pointerEvents="none" style={innerStyle}>
        {children}
      </View>
      {!highlighted && <View pointerEvents="none" style={dimStyle} />}
    </View>
  );
}
