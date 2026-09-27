// src/components/hub/DailyRewardModal/DailyRewardModal.tsx
// Ежедневная награда — модальное окно при первом за день заходе в игру
// (решение пользователя 27.09.2026; раньше — карточка в профиле). Когда
// показывать — решает DailyRewardGate (domain/daily/DailyReward.ts).
// Закрывается только получением награды: это подарок, а не выбор.

import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { StreakDayCircle } from '@/components/shared';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createDailyRewardModalStyles } from './DailyRewardModal.styles';

const STREAK_DAYS = [1, 2, 3, 4, 5, 6, 7];

export function DailyRewardModal({
  streakDay,
  bonus,
  onClaim,
}: {
  /** Какой день стрика будет засчитан этой наградой (1..). */
  streakDay: number;
  bonus: number;
  onClaim: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createDailyRewardModalStyles({ theme });
  // Позиция в недельном цикле календаря (8-й день — снова первый кружок).
  const dayInWeek = ((streakDay - 1) % 7) + 1;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClaim}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={theme.gradients.reward}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={{ fontSize: scale(48) }}>🎁</Text>
            <Text style={[styles.heroTitle, { fontSize: scaledFont('xxl') }]}>
              Ежедневная награда
            </Text>
            <Text style={[styles.heroSubtitle, { fontSize: scaledFont('lg') }]}>
              День {streakDay} подряд с Финни
            </Text>
          </LinearGradient>

          <View style={styles.body}>
            <Text
              style={[styles.bonusText, { fontSize: scaledFont('title') }]}
              accessibilityLabel={`Награда: ${formatCoins(bonus)}`}
            >
              +{formatPrice(bonus)}
            </Text>

            <View style={styles.streakRow}>
              {STREAK_DAYS.map((day) => (
                <StreakDayCircle
                  key={day}
                  day={day}
                  isCompleted={day < dayInWeek}
                  isToday={day === dayInWeek}
                  isSuperCase={day === 7}
                  size={32}
                />
              ))}
            </View>
            <Text style={[styles.hint, { fontSize: scaledFont('md') }]}>
              Заходи каждый день — награда растёт, а на 7-й день ждёт подарок.
            </Text>

            <TouchableOpacity
              onPress={onClaim}
              activeOpacity={0.85}
              style={styles.claimButton}
              accessibilityRole="button"
              accessibilityLabel={`Забрать ${formatCoins(bonus)}`}
            >
              <Text style={[styles.claimText, { fontSize: scaledFont('lg') }]}>Забрать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
