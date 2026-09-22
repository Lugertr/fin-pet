// src/components/profile/SettingsModal/SettingsModal.tsx
// Модалка настроек с переключателем темы

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Switch, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { feedback } from '@/lib/services/feedback';
import { notifications } from '@/lib/services/notifications';
import { ThemeMode, useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontWeights, radius, spacing } from '@/theme/tokens';
import type { IconName } from '@/types/icons';
import { createSettingsModalStyles } from './SettingsModal.styles';

export const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: 'system', label: 'Системная', icon: 'phone-portrait' },
  { mode: 'light', label: 'Светлая', icon: 'sunny' },
  { mode: 'dark', label: 'Тёмная', icon: 'moon' },
];

export function SettingsModal({
  visible,
  onClose,
  currentMode,
  onModeChange,
}: {
  visible: boolean;
  onClose: () => void;
  currentMode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();

  const styles = createSettingsModalStyles({ theme });

  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleToggleSounds = (value: boolean) => {
    triggerHaptic('light');
    setSoundsEnabled(value);
    feedback.setSoundsEnabled(value);
  };

  const handleToggleHaptics = (value: boolean) => {
    if (value) triggerHaptic('light');
    setHapticsEnabled(value);
    feedback.setHapticsEnabled(value);
  };

  const handleToggleNotifications = (value: boolean) => {
    triggerHaptic('light');
    setNotificationsEnabled(value);
    notifications.setEnabled(value);
  };

  const handleModeChange = (mode: ThemeMode) => {
    triggerHaptic('selection');
    onModeChange(mode);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <View
          style={[
            styles.modalContent,
            { padding: scale(spacing.xxl), paddingTop: scale(spacing.xxxl) },
          ]}
        >
          {/* Заголовок */}
          <Text style={[styles.modalTitle, { fontSize: scaledFont('xxl') }]}>Настройки</Text>
          <Text style={[styles.modalSubtitle, { fontSize: scaledFont('md') }]}>
            Настройте приложение под себя
          </Text>

          {/* Переключатели */}
          <View style={styles.toggleRowsContainer}>
            {/* Звуки */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleRowLeft}>
                <View
                  style={[
                    styles.toggleIconBox,
                    { backgroundColor: withAlpha(theme.primary, 0.15) },
                  ]}
                >
                  <Ionicons name="volume-high" size={scale(18)} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Звуки</Text>
                  <Text style={styles.toggleDescription}>Звуковые эффекты при действиях</Text>
                </View>
              </View>
              <Switch
                value={soundsEnabled}
                onValueChange={handleToggleSounds}
                trackColor={{ false: theme.textMuted, true: theme.primary }}
                thumbColor={theme.onGradient}
              />
            </View>

            {/* Вибрация */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleRowLeft}>
                <View
                  style={[
                    styles.toggleIconBox,
                    { backgroundColor: withAlpha(theme.primary, 0.15) },
                  ]}
                >
                  <Ionicons name="phone-portrait" size={scale(18)} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Вибрация</Text>
                  <Text style={styles.toggleDescription}>Тактильная отдача при нажатиях</Text>
                </View>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: theme.textMuted, true: theme.primary }}
                thumbColor={theme.onGradient}
              />
            </View>

            {/* Уведомления */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleRowLeft}>
                <View
                  style={[
                    styles.toggleIconBox,
                    { backgroundColor: withAlpha(theme.primary, 0.15) },
                  ]}
                >
                  <Ionicons name="notifications" size={scale(18)} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Уведомления</Text>
                  <Text style={styles.toggleDescription}>Напоминания о стрике и наградах</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.textMuted, true: theme.primary }}
                thumbColor={theme.onGradient}
              />
            </View>
          </View>

          {/* ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ */}
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: scaledFont('md'),
              fontWeight: fontWeights.semibold,
              marginBottom: scale(spacing.md),
            }}
          >
            Тема приложения
          </Text>
          <View style={{ gap: scale(spacing.sm), marginBottom: scale(spacing.xxl) }}>
            {THEME_OPTIONS.map((option) => {
              const isActive = currentMode === option.mode;
              return (
                <TouchableOpacity
                  key={option.mode}
                  onPress={() => handleModeChange(option.mode)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isActive
                      ? withAlpha(theme.primary, 0.125)
                      : theme.surfaceLight,
                    borderRadius: scale(radius.md),
                    padding: scale(spacing.md),
                    borderWidth: 1,
                    borderColor: isActive ? theme.primary : 'transparent',
                  }}
                >
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: scale(spacing.sm) }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={scale(18)}
                      color={isActive ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      style={{
                        color: isActive ? theme.primary : theme.textPrimary,
                        fontSize: scaledFont('md'),
                        fontWeight: isActive ? fontWeights.bold : fontWeights.medium,
                      }}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={scale(20)} color={theme.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Кнопка закрытия */}
          <Button title="Готово" onPress={onClose} variant="primary" size="lg" />
        </View>
      </View>
    </Modal>
  );
}
