// lib/hooks/useFeedback.ts
// React-хук для удобного использования feedback в компонентах

import { feedback, FeedbackPreset, HapticType, SoundType } from '@/lib/services/feedback';
import { useCallback } from 'react';

export function useFeedback() {
  const trigger = useCallback((preset: FeedbackPreset) => {
    feedback.trigger(preset);
  }, []);

  const playSound = useCallback((type: SoundType) => {
    feedback.playSound(type);
  }, []);

  const triggerHaptic = useCallback((type: HapticType) => {
    feedback.triggerHaptic(type);
  }, []);

  return {
    trigger,
    playSound,
    triggerHaptic,
  };
}
