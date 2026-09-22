// src/theme/ThemeProvider.tsx
// Провайдер темы с автоопределением и сохранением выбора

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { Theme, ThemeName, themes } from './themes';

const STORAGE_KEY = 'finsputnik-theme-preference';

/**
 * Режим выбора темы:
 * - 'system' — следует за системой (авто)
 * - 'light' / 'dark' — ручное переключение
 */
export type ThemeMode = 'system' | ThemeName;

interface ThemeContextValue {
  // Текущая активная тема (уже с применёнными цветами)
  theme: Theme;
  // Выбранный режим
  mode: ThemeMode;
  // Является ли текущая тема тёмной
  isDark: boolean;
  // Переключить режим
  setMode: (mode: ThemeMode) => void;
  // Переключить на следующую тему (по кругу)
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Системная тема устройства
  const systemScheme = useColorScheme();

  // Выбор пользователя (по умолчанию: следовать системе)
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Загрузка сохранённого выбора
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && isValidMode(saved)) {
          setModeState(saved as ThemeMode);
        }
      } catch (error) {
        console.warn('[ThemeProvider] Ошибка загрузки темы:', error);
      }
    };

    loadSavedTheme();
  }, []);

  // Определение активной темы
  const activeThemeName: ThemeName = useMemo(() => {
    if (mode === 'system') {
      // Если режим "система" — берём системную тему
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return mode;
  }, [mode, systemScheme]);

  const theme = themes[activeThemeName];
  const isDark = activeThemeName === 'dark';

  // Переключение режима с сохранением
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch((error) => {
      console.warn('[ThemeProvider] Ошибка сохранения темы:', error);
    });
  }, []);

  // Переключение по кругу: system → light → dark → system
  const cycleTheme = useCallback(() => {
    const order: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = order.indexOf(mode);
    const nextIndex = (currentIndex + 1) % order.length;
    setMode(order[nextIndex]);
  }, [mode, setMode]);

  const value = useMemo(
    () => ({
      theme,
      mode,
      isDark,
      setMode,
      cycleTheme,
    }),
    [theme, mode, isDark, setMode, cycleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Проверка валидности режима темы
 */
function isValidMode(value: string): boolean {
  return ['system', 'light', 'dark'].includes(value);
}

/**
 * Хук для использования темы в компонентах
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme должен использоваться внутри <ThemeProvider>');
  }
  return context;
}
