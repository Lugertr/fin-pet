export interface NotificationSettings {
  quests: boolean;
  petHungry: boolean;
  motivation: boolean;
  piggyBank?: boolean;
  adventures?: boolean;
  achievements?: boolean;
}

export interface AppSettings {
  notifications: NotificationSettings;
  reminderTime: string;
  parentPinHash?: string;
  soundEnabled: boolean;
  vibrationEnabled?: boolean;
  language?: 'ru' | 'en';
}
