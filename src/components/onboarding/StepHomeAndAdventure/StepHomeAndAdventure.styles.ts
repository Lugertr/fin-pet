// src/components/onboarding/StepHomeAndAdventure/StepHomeAndAdventure.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

const WORK_SCENE_BACKGROUND = '#FBE6D4';

export function createStepHomeAndAdventureStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    container: {
      gap: spacing.md,
    },
    eyebrow: {
      alignSelf: 'center',
      backgroundColor: withAlpha(theme.primary, 0.1),
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
    },
    eyebrowText: {
      color: theme.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xs,
      letterSpacing: 0.5,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
      textAlign: 'center',
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
      marginTop: -spacing.sm,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.md,
      gap: spacing.xxs,
      ...shadows.sm,
    },
    imageBox: {
      height: 130,
      borderRadius: radius.xl,
      overflow: 'hidden',
      backgroundColor: theme.surfaceLight,
      marginBottom: spacing.sm,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    // Фон сцены work.svg (#FBE6D4) — заливка полей по бокам вписанной картинки.
    workImageBox: {
      backgroundColor: WORK_SCENE_BACKGROUND,
    },
    chip: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: theme.surface,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    chipDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
    },
    chipText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.xs,
    },
    petBox: {
      position: 'absolute',
      bottom: spacing.xs,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    cardTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    cardText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    noteCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.md,
      ...shadows.sm,
    },
    noteIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noteText: {
      flex: 1,
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
  });
}
