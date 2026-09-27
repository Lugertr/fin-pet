// src/components/shared/SubpageHeader/SubpageHeader.tsx
// Шапка подэкранов раздела «Прогресс» по макету (достижения, словарь,
// настройки, документы, история операций): «назад» слева, «?» справа,
// крупный заголовок и подзаголовок под ними. «?» — HelpButton: объяснение
// экрана простыми словами из content/screen_help.json (не внешняя ссылка, §22).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ScreenHelpId } from '@/domain/content/ReferenceContent';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { HelpButton } from '../HelpButton';
import { createSubpageHeaderStyles } from './SubpageHeader.styles';

export function SubpageHeader({
  title,
  subtitle,
  help,
  onBack,
}: {
  title: string;
  subtitle?: string;
  /** Подсказка по экрану — если не задана, кнопки «?» нет. */
  help?: ScreenHelpId;
  /** По умолчанию — router.back(). */
  onBack?: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createSubpageHeaderStyles({ theme });

  const handleBack = () => {
    triggerHaptic('light');
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile' as never);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + scale(spacing.sm), paddingHorizontal: scale(spacing.lg) },
      ]}
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Назад"
        >
          <Ionicons name="chevron-back" size={scale(26)} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.iconButton}>{help && <HelpButton screen={help} />}</View>
      </View>

      <View style={{ paddingHorizontal: scale(spacing.sm) }}>
        <Text style={[styles.title, { fontSize: scaledFont('title') }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { fontSize: scaledFont('lg') }]}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}
