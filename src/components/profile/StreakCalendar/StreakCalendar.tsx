// src/components/profile/StreakCalendar/StreakCalendar.tsx
// Недельный стрик-календарь на экране профиля

import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { StreakDayCircle } from '@/components/shared';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes } from '@/theme/tokens';
import { createStreakCalendarStyles } from './StreakCalendar.styles';

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function StreakCalendar({ currentStreak }: { currentStreak: number }) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();

  const styles = createStreakCalendarStyles({ theme });

  return (
    <View>
      <View style={styles.streakDaysRow}>
        {DAYS.map((day) => {
          const isCompleted = day <= currentStreak;
          const isToday = day === currentStreak + 1;
          const isSuperCase = day === 7;

          return (
            <View key={day} style={styles.streakDayContainer}>
              <StreakDayCircle
                day={day}
                isCompleted={isCompleted}
                isToday={isToday}
                isSuperCase={isSuperCase}
                size={36}
              />
              <Text style={[styles.streakDayName, { fontSize: scaledFont('xxs') }]}>
                {DAY_NAMES[day - 1]}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.streakProgressBar}>
        <LinearGradient
          colors={[colorPalettes.amber[500], colorPalettes.amber[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: '100%',
            width: `${(currentStreak / 7) * 100}%`,
          }}
        />
      </View>

      <View
        style={[
          styles.streakInfoBanner,
          {
            backgroundColor: withAlpha(theme.warning, 0.125),
            borderColor: withAlpha(theme.warning, 0.251),
          },
        ]}
      >
        <Text style={{ fontSize: scaledFont('xxl') }}>🎁</Text>
        <Text style={[styles.streakInfoText, { color: theme.warning, fontSize: scaledFont('sm') }]}>
          Супер-кейс с редкими предметами на 7-й день серии!
        </Text>
      </View>
    </View>
  );
}
