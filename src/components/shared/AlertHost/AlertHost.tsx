// src/components/shared/AlertHost/AlertHost.tsx
// Единственный алерт-диалог на всё приложение — рендерится один раз в
// корневом _layout.tsx, показывает то, что записано в useAlertStore (см.
// lib/utils/alert.ts). Собственная тема вместо react-native's Alert — та
// на react-native-web не показывается вообще (см. комментарий в alertStore.ts).

import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { AlertButton, useAlertStore } from '@/lib/stores/alertStore';
import { useTheme } from '@/theme';
import { createAlertHostStyles } from './AlertHost.styles';

export function AlertHost() {
  const { theme } = useTheme();
  const { visible, title, message, buttons, hide } = useAlertStore();
  const styles = createAlertHostStyles({ theme });

  const handlePress = (button: AlertButton) => {
    hide();
    button.onPress?.();
  };

  const buttonStyleFor = (style: AlertButton['style']) =>
    style === 'cancel'
      ? styles.buttonCancel
      : style === 'destructive'
        ? styles.buttonDestructive
        : styles.buttonDefault;

  const textStyleFor = (style: AlertButton['style']) =>
    style === 'cancel'
      ? styles.buttonTextCancel
      : style === 'destructive'
        ? styles.buttonTextDestructive
        : styles.buttonTextDefault;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonsColumn}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={`${button.text}-${index}`}
                onPress={() => handlePress(button)}
                activeOpacity={0.8}
                style={[styles.button, buttonStyleFor(button.style)]}
              >
                <Text style={[styles.buttonText, textStyleFor(button.style)]}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
