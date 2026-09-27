// src/components/adultSection/DemoModeCard/DemoModeCard.tsx
// Карточка "Демо-режим" (§18, флаг demo_mode) в разделе для взрослого.
// Включить демо можно и здесь, и переключателем на первом экране онбординга;
// «Начать демо заново» удаляет демо-профиль и открывает онбординг.

import { Switch, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { isFeatureEnabled } from '@/config/featureFlags';
import { useUserStore } from '@/lib/stores/userStore';
import { useResponsive, useTheme } from '@/theme';
import { createAdultSectionCardsStyles } from '../adultSectionCards.styles';

export function DemoModeCard({
  isBusy,
  onToggleDemo,
  onResetDemo,
}: {
  isBusy: boolean;
  onToggleDemo: (next: boolean) => void;
  onResetDemo: () => void;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const user = useUserStore((s) => s.user);
  const styles = createAdultSectionCardsStyles({ theme });

  if (!isFeatureEnabled('demo_mode')) return null;

  return (
    <>
      <Text style={[styles.sectionTitle, { fontSize: scaledFont('lg') }]}>Демо-режим</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.switchLabel, { fontSize: scaledFont('md') }]}>
              Режим для демонстрации
            </Text>
            <Text style={[styles.switchHint, { fontSize: scaledFont('xs') }]}>
              Весь сценарий за 1–2 минуты: все уроки открыты, события сразу, короткие раунды Аркады
              и урока, каждое приключение — новый уровень
            </Text>
          </View>
          <Switch value={user?.is_demo ?? false} onValueChange={onToggleDemo} disabled={isBusy} />
        </View>
      </View>

      {user?.is_demo && (
        <TouchableOpacity
          onPress={onResetDemo}
          disabled={isBusy}
          activeOpacity={0.8}
          style={[styles.neutralButton, { opacity: isBusy ? 0.6 : 1 }]}
        >
          <Text style={styles.neutralButtonText}>Начать демо заново</Text>
        </TouchableOpacity>
      )}
    </>
  );
}
