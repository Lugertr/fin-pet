// src/app/(modal)/adult-section.tsx
// Раздел для взрослого (§17 ТЗ): барьер входа, цели/прогресс/пройденные темы,
// сброс/удаление профиля, демо-режим (§18). Без негативных оценок ребёнка,
// удаление — только с подтверждением (§17.3).

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  AppGoalsCard,
  BranchProgressCard,
  DangerZoneActions,
  DemoModeCard,
  PinGate,
  StatsCard,
} from '@/components/adultSection';
import { SubpageHeader } from '@/components/shared';
import { useFeedback } from '@/lib/hooks/useFeedback';
import {
  deleteProfileCompletely,
  resetProfileToInitialState,
  setDemoMode,
} from '@/lib/profile/profileReset';
import { hasPinSet } from '@/lib/security/parentalPin';
import { Alert } from '@/lib/utils/alert';
import { useTheme } from '@/theme';
import { createAdultSectionStyles } from '../../styles/screens/modal/_adult-section.styles';

type Stage = 'loading' | 'pin-setup' | 'pin-entry' | 'content';

export default function AdultSectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { triggerHaptic } = useFeedback();

  const styles = createAdultSectionStyles({ theme });

  const [stage, setStage] = useState<Stage>('loading');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hasPinSet().then((exists) => {
      if (!cancelled) setStage(exists ? 'pin-entry' : 'pin-setup');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResetProfile = () => {
    Alert.alert(
      'Сбросить профиль?',
      'Весь игровой прогресс и экономика вернутся к исходному состоянию. Имя и питомец сохранятся. Действие необратимо.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            setIsBusy(true);
            try {
              await resetProfileToInitialState();
              triggerHaptic('success');
              router.replace('/(tabs)' as never);
            } catch (error) {
              console.error('[AdultSection] Не удалось сбросить профиль:', error);
              Alert.alert('Ошибка', 'Не удалось сбросить профиль');
            } finally {
              setIsBusy(false);
            }
          },
        },
      ],
      { icon: 'refresh', badgeLabel: 'Сброс', badgeVariant: 'warning' }
    );
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Удалить профиль?',
      'Все локальные данные будут удалены без возможности восстановления.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            setIsBusy(true);
            try {
              await deleteProfileCompletely();
              triggerHaptic('success');
              router.replace('/(auth)/onboarding' as never);
            } catch (error) {
              console.error('[AdultSection] Не удалось удалить профиль:', error);
              Alert.alert('Ошибка', 'Не удалось удалить профиль');
            } finally {
              setIsBusy(false);
            }
          },
        },
      ],
      { icon: 'trash', badgeLabel: 'Удаление', badgeVariant: 'error' }
    );
  };

  const handleToggleDemo = async (next: boolean) => {
    setIsBusy(true);
    try {
      const ok = await setDemoMode(next);
      if (!ok) {
        Alert.alert('Ошибка', 'Не удалось изменить демо-режим');
        return;
      }
      triggerHaptic('medium');
      // §18.2: активация демо-режима сразу возвращает профиль к исходному состоянию
      if (next) {
        await resetProfileToInitialState();
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetDemo = () => {
    Alert.alert(
      'Сбросить демо?',
      'Тестовый профиль вернётся к исходному состоянию.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            setIsBusy(true);
            try {
              await resetProfileToInitialState();
              triggerHaptic('success');
              router.replace('/(tabs)' as never);
            } finally {
              setIsBusy(false);
            }
          },
        },
      ],
      { icon: 'refresh', badgeLabel: 'Сброс', badgeVariant: 'warning' }
    );
  };

  if (stage === 'loading') {
    return <View style={styles.container} />;
  }

  if (stage === 'pin-setup' || stage === 'pin-entry') {
    return (
      <PinGate
        initialMode={stage === 'pin-setup' ? 'setup' : 'entry'}
        onUnlocked={() => setStage('content')}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <SubpageHeader
        title="Родителям"
        subtitle="прогресс ребёнка и управление профилем"
        help="parents"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppGoalsCard />
        <BranchProgressCard />
        <StatsCard />
        <DemoModeCard
          isBusy={isBusy}
          onToggleDemo={handleToggleDemo}
          onResetDemo={handleResetDemo}
        />
        <DangerZoneActions
          isBusy={isBusy}
          onResetProfile={handleResetProfile}
          onDeleteProfile={handleDeleteProfile}
        />
      </ScrollView>
    </View>
  );
}
