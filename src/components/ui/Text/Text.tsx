// src/components/ui/Text/Text.tsx
// Text и TextInput приложения — те же компоненты react-native, но со шрифтом
// Manrope. В RN нет глобального шрифта по умолчанию, а у Manrope каждая
// жирность — своё семейство (см. theme/fonts.ts), поэтому здесь fontWeight
// стиля превращается в fontFamily нужного файла, а сам fontWeight
// сбрасывается: иначе поверх жирного файла дорисовывается ложный жирный
// (в вебе — всегда). Явно заданный fontFamily не трогается.
// Импортировать Text/TextInput нужно отсюда — ESLint запрещает брать их из
// react-native напрямую (eslint.config.js).

import { createContext, forwardRef, useContext } from 'react';
import {
  // eslint-disable-next-line no-restricted-imports -- обёртка над исходными компонентами
  Text as RNText,
  // eslint-disable-next-line no-restricted-imports -- обёртка над исходными компонентами
  TextInput as RNTextInput,
  StyleSheet,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { fontFamilyForWeight } from '@/theme/fonts';

/** Вложенный Text наследует шрифт родителя, если сам жирность не задаёт. */
const InsideText = createContext(false);

function withAppFont(style: StyleProp<TextStyle>, inheritsFont: boolean): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style);
  if (flat?.fontFamily) return style;
  if (inheritsFont && flat?.fontWeight === undefined) return style;
  return [style, { fontFamily: fontFamilyForWeight(flat?.fontWeight), fontWeight: 'normal' }];
}

export const Text = forwardRef<RNText, TextProps>(function Text(
  { style, children, ...props },
  ref
) {
  const insideText = useContext(InsideText);
  return (
    <RNText ref={ref} style={withAppFont(style, insideText)} {...props}>
      <InsideText.Provider value={true}>{children}</InsideText.Provider>
    </RNText>
  );
});

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
  { style, ...props },
  ref
) {
  return <RNTextInput ref={ref} style={withAppFont(style, false)} {...props} />;
});
