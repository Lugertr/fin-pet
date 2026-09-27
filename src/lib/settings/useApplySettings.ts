// lib/settings/useApplySettings.ts
// Сохранённые настройки (звуки/вибрация/уведомления из preferencesStore)
// применяются к сервисам при старте и при каждом изменении. Смонтирован один
// раз в корневом layout — экран «Настройки» меняет только стор.

import { useEffect } from 'react';

import { feedback } from '@/lib/services/feedback';
import { notifications } from '@/lib/services/notifications';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';

export function useApplySettings() {
  const soundsEnabled = usePreferencesStore((s) => s.soundsEnabled);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);
  const notificationsEnabled = usePreferencesStore((s) => s.notificationsEnabled);

  useEffect(() => {
    feedback.setSoundsEnabled(soundsEnabled);
  }, [soundsEnabled]);

  useEffect(() => {
    feedback.setHapticsEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  useEffect(() => {
    notifications.setEnabled(notificationsEnabled);
  }, [notificationsEnabled]);
}
