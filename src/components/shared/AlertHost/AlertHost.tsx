// src/components/shared/AlertHost/AlertHost.tsx
// Единственный алерт-диалог на всё приложение — рендерится один раз в
// корневом _layout.tsx, показывает то, что записано в useAlertStore (см.
// lib/utils/alert.ts). Собственная тема вместо react-native's Alert — та
// на react-native-web не показывается вообще (см. комментарий в alertStore.ts).
//
// 2 разных вида в одном компоненте, по числу кнопок:
// - 1 кнопка (информационный алерт) — просто заголовок/текст/одна кнопка,
//   без иконки и плашки — это не решение «да/нет», карточка-подтверждение
//   тут не нужна.
// - 2+ кнопки (подтверждение) — карточка с кружком-иконкой (+ опциональной
//   цветной плашкой сверху), кнопка отмены становится текстовой ссылкой
//   снизу, а не ещё одной закрашенной кнопкой — см. референс дизайна.

import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import type { IconName } from '@/types/icons';
import { AlertButton, useAlertStore } from '@/lib/stores/alertStore';
import { useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { createAlertHostStyles } from './AlertHost.styles';

export function AlertHost() {
  const { theme } = useTheme();
  const { visible, title, message, buttons, icon, badgeLabel, badgeVariant, hide } =
    useAlertStore();
  const styles = createAlertHostStyles({ theme });

  const handlePress = (button: AlertButton) => {
    hide();
    button.onPress?.();
  };

  const isConfirmation = buttons.length > 1;
  const cancelButton = isConfirmation
    ? [...buttons].reverse().find((b) => b.style === 'cancel')
    : undefined;
  const actionButtons = isConfirmation ? buttons.filter((b) => b !== cancelButton) : buttons;
  const hasDestructive = actionButtons.some((b) => b.style === 'destructive');

  const resolvedVariant = badgeVariant ?? (hasDestructive ? 'error' : undefined);
  const accentColor =
    resolvedVariant === 'error'
      ? theme.error
      : resolvedVariant === 'warning'
        ? theme.warning
        : resolvedVariant === 'info'
          ? theme.info
          : theme.primary;
  const resolvedIcon: IconName = icon ?? (hasDestructive ? 'trash' : 'help-circle');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {isConfirmation && badgeLabel && (
            <View style={[styles.badge, { backgroundColor: accentColor }]}>
              <Text style={styles.badgeText}>{badgeLabel}</Text>
            </View>
          )}

          {isConfirmation && (
            <View style={[styles.iconCircle, { backgroundColor: withAlpha(accentColor, 0.12) }]}>
              <Ionicons name={resolvedIcon} size={28} color={accentColor} />
            </View>
          )}

          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          {actionButtons.map((button, index) => (
            <TouchableOpacity
              key={`${button.text}-${index}`}
              onPress={() => handlePress(button)}
              activeOpacity={0.8}
              style={[
                styles.actionButton,
                button.style === 'destructive'
                  ? styles.actionButtonDestructive
                  : styles.actionButtonDefault,
              ]}
            >
              <Text style={styles.actionButtonText}>{button.text}</Text>
            </TouchableOpacity>
          ))}

          {cancelButton && (
            <TouchableOpacity
              onPress={() => handlePress(cancelButton)}
              activeOpacity={0.7}
              style={styles.cancelLink}
            >
              <Text style={styles.cancelLinkText}>{cancelButton.text}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
