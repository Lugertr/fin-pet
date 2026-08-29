// lib/services/feedback.ts
// Единый сервис для звуков и тактильной отдачи

import { Audio, AVPlaybackSource } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Типы звуков
export type SoundType =
  'correct' | 'wrong' | 'coin' | 'levelUp' | 'click' | 'daily' | 'error' | 'success';

// Типы тактильной отдачи
export type HapticType =
  'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// Маппинг звуков к файлам
// require() для локальных ассетов возвращает number (asset ID) в React Native
// Типизируем как AVPlaybackSource, который принимает number или объект с uri
const SOUND_MAP: Record<SoundType, AVPlaybackSource | null> = {
  correct: require('../../../assets/sounds/correct.mp3') as AVPlaybackSource,
  wrong: require('../../../assets/sounds/wrong.mp3') as AVPlaybackSource,
  coin: require('../../../assets/sounds/coin.mp3') as AVPlaybackSource,
  levelUp: require('../../../assets/sounds/level-up.mp3') as AVPlaybackSource,
  click: require('../../../assets/sounds/click.mp3') as AVPlaybackSource,
  daily: require('../../../assets/sounds/daily.mp3') as AVPlaybackSource,
  error: require('../../../assets/sounds/error.mp3') as AVPlaybackSource,
  success: require('../../../assets/sounds/success.mp3') as AVPlaybackSource,
};

// Пресеты: звук + haptic для типичных сценариев
export type FeedbackPreset =
  | 'correctAnswer'
  | 'wrongAnswer'
  | 'earnCoins'
  | 'lessonComplete'
  | 'purchase'
  | 'dailyClaim'
  | 'buttonClick'
  | 'error';

const PRESETS: Record<FeedbackPreset, { sound: SoundType; haptic: HapticType }> = {
  correctAnswer: { sound: 'correct', haptic: 'medium' },
  wrongAnswer: { sound: 'wrong', haptic: 'heavy' },
  earnCoins: { sound: 'coin', haptic: 'light' },
  lessonComplete: { sound: 'levelUp', haptic: 'success' },
  purchase: { sound: 'success', haptic: 'medium' },
  dailyClaim: { sound: 'daily', haptic: 'success' },
  buttonClick: { sound: 'click', haptic: 'light' },
  error: { sound: 'error', haptic: 'error' },
};

class FeedbackService {
  private soundCache: Map<SoundType, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private soundsEnabled: boolean = true;
  private hapticsEnabled: boolean = true;
  private isInitialized: boolean = false;

  /**
   * Инициализация аудио-сессии
   * Вызывать при старте приложения
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('[Feedback] Ошибка инициализации аудио:', error);
    }
  }

  /**
   * Включить/выключить всю обратную связь
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Включить/выключить звуки
   */
  setSoundsEnabled(enabled: boolean): void {
    this.soundsEnabled = enabled;
  }

  /**
   * Включить/выключить тактильную отдачу
   */
  setHapticsEnabled(enabled: boolean): void {
    this.hapticsEnabled = enabled;
  }

  /**
   * Проиграть звук по типу
   */
  async playSound(type: SoundType): Promise<void> {
    if (!this.isEnabled || !this.soundsEnabled) return;

    try {
      // Используем кэш звуков для производительности
      let sound = this.soundCache.get(type);

      if (!sound) {
        const soundSource = SOUND_MAP[type];
        if (!soundSource) return;

        const { sound: newSound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: false, volume: 0.7 },
          null,
          false
        );
        sound = newSound;
        this.soundCache.set(type, sound);
      }

      // Сбрасываем позицию и играем
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.warn(`[Feedback] Не удалось проиграть звук ${type}:`, error);
    }
  }

  /**
   * Вызвать тактильную отдачу
   */
  async triggerHaptic(type: HapticType): Promise<void> {
    if (!this.isEnabled || !this.hapticsEnabled) return;

    // На вебе haptics недоступны
    if (Platform.OS === 'web') return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
      }
    } catch (error) {
      console.warn(`[Feedback] Ошибка haptic ${type}:`, error);
    }
  }

  /**
   * Применить пресет (звук + haptic)
   */
  async trigger(preset: FeedbackPreset): Promise<void> {
    const config = PRESETS[preset];
    if (!config) return;

    // Запускаем параллельно для синхронности
    await Promise.all([this.playSound(config.sound), this.triggerHaptic(config.haptic)]);
  }

  /**
   * Очистить кэш звуков (вызывать при выходе)
   */
  async cleanup(): Promise<void> {
    for (const sound of this.soundCache.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Игнорируем ошибки выгрузки
      }
    }
    this.soundCache.clear();
  }
}

// Экспортируем единственный экземпляр (singleton)
export const feedback = new FeedbackService();
