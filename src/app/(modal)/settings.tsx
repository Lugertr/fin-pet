// src/app/(modal)/settings.tsx
// «Настройки» из вкладки «Прогресс» (решение пользователя 27.09.2026 —
// раньше модалка в профиле): звуки, вибрация, уведомления и тема. Значения
// сохраняются в preferencesStore и применяются к сервисам через
// lib/settings/useApplySettings (раньше сбрасывались при каждом открытии).

import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

import { createProfileCardStyles } from '@/components/profile';
import { SubpageHeader } from '@/components/shared';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { createProgressSubpageStyles } from '@/styles/screens/modal/_progress-subpage.styles';
import { ThemeMode, useResponsive, useTheme } from '@/theme';
import { colorPalettes } from '@/theme/tokens';
import type { IconName } from '@/types/icons';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: 'system', label: 'Как на телефоне', icon: 'phone-portrait-outline' },
  { mode: 'light', label: 'Светлая', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Тёмная', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { theme, mode, setMode } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createProgressSubpageStyles({ theme });
  const cards = createProfileCardStyles({ theme });

  const soundsEnabled = usePreferencesStore((s) => s.soundsEnabled);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);
  const notificationsEnabled = usePreferencesStore((s) => s.notificationsEnabled);
  const setSoundsEnabled = usePreferencesStore((s) => s.setSoundsEnabled);
  const setHapticsEnabled = usePreferencesStore((s) => s.setHapticsEnabled);
  const setNotificationsEnabled = usePreferencesStore((s) => s.setNotificationsEnabled);

  const toggles: {
    key: string;
    icon: IconName;
    label: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }[] = [
    {
      key: 'sounds',
      icon: 'volume-high-outline',
      label: 'Звуки',
      description: 'Звуки при действиях',
      value: soundsEnabled,
      onChange: setSoundsEnabled,
    },
    {
      key: 'haptics',
      icon: 'phone-portrait-outline',
      label: 'Вибрация',
      description: 'Лёгкая отдача при нажатиях',
      value: hapticsEnabled,
      onChange: (value) => {
        setHapticsEnabled(value);
        if (value) triggerHaptic('light');
      },
    },
    {
      key: 'notifications',
      icon: 'notifications-outline',
      label: 'Уведомления',
      description: 'Напоминания о стрике и энергии',
      value: notificationsEnabled,
      onChange: setNotificationsEnabled,
    },
  ];

  return (
    <View style={styles.container}>
      <SubpageHeader title="Настройки" subtitle="звук, вибрация и тема" help="settings" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={cards.card}>
          {toggles.map((toggle, index) => (
            <View
              key={toggle.key}
              style={[cards.row, index < toggles.length - 1 && cards.rowDivider]}
            >
              <Ionicons name={toggle.icon} size={scale(22)} color={colorPalettes.indigo[500]} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { fontSize: scaledFont('lg') }]}>
                  {toggle.label}
                </Text>
                <Text style={[styles.settingDescription, { fontSize: scaledFont('sm') }]}>
                  {toggle.description}
                </Text>
              </View>
              <Switch
                value={toggle.value}
                onValueChange={toggle.onChange}
                accessibilityLabel={toggle.label}
                trackColor={{ false: theme.textMuted, true: theme.primary }}
                thumbColor={theme.onGradient}
              />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { fontSize: scaledFont('md') }]}>Тема</Text>
        <View style={cards.card}>
          {THEME_OPTIONS.map((option, index) => {
            const isActive = mode === option.mode;
            return (
              <TouchableOpacity
                key={option.mode}
                onPress={() => {
                  triggerHaptic('selection');
                  setMode(option.mode);
                }}
                activeOpacity={0.7}
                style={[styles.themeOption, index < THEME_OPTIONS.length - 1 && cards.rowDivider]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Тема: ${option.label}`}
              >
                <Ionicons name={option.icon} size={scale(22)} color={colorPalettes.amber[500]} />
                <Text
                  style={[styles.settingLabel, styles.settingText, { fontSize: scaledFont('lg') }]}
                >
                  {option.label}
                </Text>
                {/* Выбранная тема — галочкой, а не только цветом (§23). */}
                <Ionicons
                  name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                  size={scale(22)}
                  color={isActive ? theme.primary : theme.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
