// src/components/shared/AppHeaderStats/AppHeaderStats.tsx
// Единая шапка приложения — на всех вкладках таб-бара (хаб/уроки/магазин/
// ИИ-чат/профиль) и экранах приключения, кроме онбординга. По макету
// пользователя (27.09.2026): лого, плашка кошелька «80 C» с декоративной
// полоской «надо / хочу / коплю» под суммой, плашка энергии и кнопка профиля.
// Банк в шапке не показывается — он в «Банке» (копилка в комнате) и профиле.
// Принимает уже посчитанные значения — экран сам решает, откуда их брать.
// С leftAction вместо лого слева стоит кнопка-иконка («назад» на
// планировании, «завершить» в приключении) — шапка остаётся на той же
// высоте, что и на вкладках, без отдельной строки под кнопку над ней.
// help — кнопка «?» с подсказкой по экрану рядом с лого (у каждого экрана
// детского приложения — объяснение, см. content/screen_help.json).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { IconButton } from '@/components/ui';
import { PLAN_CATEGORY_COLORS } from '@/constants/planCategories';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import type { ScreenHelpId } from '@/domain/content/ReferenceContent';
import type { IconName } from '@/types/icons';
import { useResponsive, useTheme } from '@/theme';
import { HelpButton } from '../HelpButton';
import { createAppHeaderStatsStyles } from './AppHeaderStats.styles';

/** Порядок сегментов полоски — как в плане приключения: надо, хочу, коплю. */
const PLAN_STRIP_COLORS = [
  PLAN_CATEGORY_COLORS.need,
  PLAN_CATEGORY_COLORS.want,
  PLAN_CATEGORY_COLORS.save,
];

export function AppHeaderStats({
  energy,
  coins,
  title,
  leftAction,
  help,
  helpPosition = 'left',
  rightActions = [],
  hideProfile = false,
}: {
  energy: number;
  coins: number;
  /** Заголовок экрана рядом с кнопкой слева (например «Работа» на экране смены). */
  title?: string;
  /** Вместо лого слева — кнопка-иконка (у неё нет подписи, поэтому label обязателен, §23). */
  leftAction?: { icon: IconName; onPress: () => void; accessibilityLabel: string };
  /** Подсказка по экрану — кнопка «?» (по умолчанию слева, рядом с лого/кнопкой). */
  help?: ScreenHelpId;
  /** Где «?»: слева у лого или справа, рядом с монетами и энергией. */
  helpPosition?: 'left' | 'right';
  /** Кнопки-иконки справа перед кошельком (напр. «завершить» на экране приключения). */
  rightActions?: { icon: IconName; onPress: () => void; accessibilityLabel: string }[];
  /** Без кнопки профиля — на внутренних экранах, где справа тесно. */
  hideProfile?: boolean;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createAppHeaderStatsStyles({ theme });

  const handleProfilePress = () => {
    triggerHaptic('light');
    router.push('/(tabs)/profile' as never);
  };

  return (
    <View style={styles.row}>
      <View style={styles.leftGroup}>
        {leftAction ? (
          <>
            <IconButton
              icon={leftAction.icon}
              onPress={leftAction.onPress}
              accessibilityLabel={leftAction.accessibilityLabel}
            />
            {title && (
              <Text
                style={[styles.logoText, { fontSize: scaledFont('xl') }]}
                numberOfLines={1}
                accessibilityRole="header"
              >
                {title}
              </Text>
            )}
          </>
        ) : (
          <Text style={[styles.logoText, { fontSize: scaledFont('xl') }]} numberOfLines={1}>
            Финни
          </Text>
        )}
        {help && helpPosition === 'left' && <HelpButton screen={help} />}
      </View>

      <View style={styles.rightGroup}>
        {help && helpPosition === 'right' && <HelpButton screen={help} />}
        {rightActions.map((action) => (
          <IconButton
            key={action.accessibilityLabel}
            icon={action.icon}
            onPress={action.onPress}
            accessibilityLabel={action.accessibilityLabel}
          />
        ))}
        <View
          style={[styles.pill, { paddingHorizontal: scale(10), minHeight: scale(44) }]}
          accessible
          accessibilityLabel={`В кошельке ${formatCoins(coins)}`}
        >
          <Ionicons name="wallet-outline" size={scale(18)} color={theme.primary} />
          <View style={styles.walletColumn}>
            <Text style={[styles.pillText, { fontSize: scaledFont('lg') }]}>
              {formatPrice(coins)}
            </Text>
            {/* Чисто декоративная полоска цветов «надо / хочу / коплю» (§23:
                смысл суммы передаёт текст, а не цвет). */}
            <View style={styles.planStrip}>
              {PLAN_STRIP_COLORS.map((color) => (
                <View key={color} style={[styles.planStripSegment, { backgroundColor: color }]} />
              ))}
            </View>
          </View>
        </View>

        <View
          style={[styles.pill, { paddingHorizontal: scale(8), minHeight: scale(44) }]}
          accessible
          accessibilityLabel={`Энергия ${Math.round(energy)}`}
        >
          <Ionicons name="flash" size={scale(16)} color={theme.warning} />
          <Text style={[styles.pillText, { fontSize: scaledFont('lg') }]}>
            {Math.round(energy)}
          </Text>
        </View>

        {!hideProfile && (
          <TouchableOpacity
            onPress={handleProfilePress}
            activeOpacity={0.8}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            accessibilityRole="button"
            accessibilityLabel="Профиль"
            style={[
              styles.profileButton,
              { width: scale(40), height: scale(40), borderRadius: scale(20) },
            ]}
          >
            <Ionicons name="person" size={scale(20)} color={theme.onGradient} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
