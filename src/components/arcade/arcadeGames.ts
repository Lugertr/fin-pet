// src/components/arcade/arcadeGames.ts
// Подписи и иконки мини-игр Аркады — для списка игр, старта и хода раунда.

import type { ArcadeGameType } from '@/domain/arcade/TrainerSelection';
import type { ScreenHelpId } from '@/domain/content/ReferenceContent';
import type { IconName } from '@/types/icons';

export const ARCADE_GAME_META: Record<
  ArcadeGameType,
  {
    title: string;
    icon: IconName;
    /** Что делать в игре — одна фраза для списка и стартового экрана. */
    description: string;
    /** Подпись счётчика раунда: «Вопрос 1 из 10». */
    unitLabel: string;
    /** Подпись длины раунда в списке: «Вопросов: 10». */
    countLabel: string;
    /** Подсказка «?» — как играть (content/screen_help.json). */
    help: ScreenHelpId;
  }
> = {
  quiz: {
    title: 'Викторина',
    icon: 'help-circle',
    description: 'Выбирай правильный ответ и получай монеты',
    unitLabel: 'Вопрос',
    countLabel: 'Вопросов',
    help: 'game_quiz',
  },
  tinder_swipe: {
    title: 'Свайпы',
    icon: 'swap-horizontal',
    description: 'Реши, как поступить: смахни карточку влево или вправо',
    unitLabel: 'Ситуация',
    countLabel: 'Ситуаций',
    help: 'game_swipes',
  },
  five_letters: {
    title: '5 букв',
    icon: 'grid',
    description: 'Угадай слово из пяти букв — на каждое 6 попыток',
    unitLabel: 'Слово',
    countLabel: 'Слов',
    help: 'game_five_letters',
  },
};
