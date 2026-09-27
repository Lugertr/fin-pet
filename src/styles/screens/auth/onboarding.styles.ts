// src/app/(auth)/onboarding.styles.ts
// Стили самого экрана онбординга — только контейнер, скролл, футер и header
// (кнопка назад). Стили шагов — в src/components/onboarding/onboardingSteps.styles.ts.
//
// Кнопка «назад» (header) и футер (точки-пагинация + «Дальше») — ОБА вне
// ScrollView, зафиксированы сверху/снизу экрана. header всегда рендерит
// IconButton (просто скрывает на шаге 1 через opacity, см. onboarding.tsx) —
// поэтому сама зона имеет одну и ту же высоту на всех шагах и не участвует в
// центрировании контента.
//
// scrollContent — с justifyContent:'center': контент шага центрируется в
// зоне между header и футером. Сама эта зона теперь стабильна по высоте на
// любом шаге (header/футер больше не меняют высоту), поэтому не скачут ни
// кнопка назад, ни «Дальше» — только сам центрируемый контент шага чуть
// сдвигается по вертикали в зависимости от своей высоты, что и есть
// ожидаемое поведение центрирования, а не баг.

import { spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createOnboardingStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollArea: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xxl,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.lg,
    },
    // На широких экранах (планшет/веб) контент не растягивается на всю
    // ширину — иначе он прилипает к левому краю (align-items:stretch по
    // умолчанию ведёт себя как flex-start для элементов с фиксированной
    // шириной), а справа остаётся пустое пространство. Ограничиваем ширину
    // колонкой «как на телефоне» и центрируем; на узких экранах maxWidth
    // просто не включается — 100% ширины ведёт себя как раньше.
    contentColumn: {
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
    },
    // Шаг выбора питомца: лента карточек на всю ширину экрана (по центру),
    // без колонки 520px — на широком экране три карточки встают в ряд.
    contentColumnWide: {
      maxWidth: '100%',
    },
    header: {
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xxl,
      paddingTop: spacing.md,
    },
    footer: {
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
      paddingHorizontal: spacing.xxl,
      paddingTop: spacing.md,
    },
    backButtonVisible: {
      opacity: 1,
      pointerEvents: 'auto',
    },
    backButtonHidden: {
      opacity: 0,
      pointerEvents: 'none',
    },
  });
}
