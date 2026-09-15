// lib/hooks/useLessons.ts
// Хук для работы с уроками: ветки, прогресс, мини-игры
// С интеграцией бонуса +10% для приоритетных веток

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { usePetStore } from '../stores/petStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import { useUserStore } from '../stores/userStore';

export interface Lesson {
  id: number;
  branch_id: number;
  title: string;
  order_index: number;
  minigame_type: 'quiz' | 'tinder_swipe';
  questions: Question[];
}

export interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  question_type: 'minigame' | 'test';
}

export interface Branch {
  id: number;
  name: string;
  description: string;
}

export interface LessonProgress {
  lesson_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  completed_at: string | null;
}

// Ветки компетенций
export const BRANCHES: Branch[] = [
  { id: 1, name: 'Бюджет', description: 'Управление доходами и расходами' },
  { id: 2, name: 'Безопасность', description: 'Защита от мошенников' },
  { id: 3, name: 'Инвестиции', description: 'Основы инвестирования' },
  { id: 4, name: 'Налоги', description: 'Налоговая грамотность' },
  { id: 5, name: 'Кредиты', description: 'Разумное использование кредитов' },
  { id: 6, name: 'Бизнес', description: 'Предпринимательство' },
  { id: 7, name: 'Экономика', description: 'Основы экономики' },
];

// Уроки с вопросами
export const LESSONS: Lesson[] = [
  // Ветка 1: Бюджет
  {
    id: 1,
    branch_id: 1,
    title: 'Что такое бюджет?',
    order_index: 1,
    minigame_type: 'quiz',
    questions: [
      {
        id: 1,
        question_text: 'Что такое бюджет?',
        options: ['План доходов и расходов', 'Вид инвестиций', 'Тип кредита', 'Способ оплаты'],
        correct_answer: 'План доходов и расходов',
        question_type: 'minigame',
      },
      {
        id: 2,
        question_text: 'Зачем нужен бюджет?',
        options: ['Контроль расходов', 'Для красоты', 'Чтобы тратить больше', 'Не нужен'],
        correct_answer: 'Контроль расходов',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 2,
    branch_id: 1,
    title: 'Правило 50/30/20',
    order_index: 2,
    minigame_type: 'quiz',
    questions: [
      {
        id: 3,
        question_text: 'Сколько процентов по правилу 50/30/20 идёт на нужды?',
        options: ['50%', '30%', '20%', '10%'],
        correct_answer: '50%',
        question_type: 'minigame',
      },
      {
        id: 4,
        question_text: 'Сколько процентов идёт на сбережения?',
        options: ['50%', '30%', '20%', '10%'],
        correct_answer: '20%',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 3,
    branch_id: 1,
    title: 'Финансовая подушка',
    order_index: 3,
    minigame_type: 'quiz',
    questions: [
      {
        id: 5,
        question_text: 'На сколько месяцев должна быть финансовая подушка?',
        options: ['1 месяц', '3-6 месяцев', '1 год', 'Не нужна'],
        correct_answer: '3-6 месяцев',
        question_type: 'minigame',
      },
    ],
  },
  // Ветка 2: Безопасность
  {
    id: 4,
    branch_id: 2,
    title: 'Что такое фишинг?',
    order_index: 1,
    minigame_type: 'tinder_swipe',
    questions: [
      {
        id: 6,
        question_text:
          'Вам пришло письмо: "Вы выиграли миллион! Переведите 500₽ для получения". Что делать?',
        options: [
          'Игнорировать и удалить',
          'Перевести деньги',
          'Ответить и узнать детали',
          'Поделиться с друзьями',
        ],
        correct_answer: 'Игнорировать и удалить',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 5,
    branch_id: 2,
    title: 'Защита паролей',
    order_index: 2,
    minigame_type: 'quiz',
    questions: [
      {
        id: 7,
        question_text: 'Какое из действий безопасно?',
        options: [
          'Проверять URL сайта перед вводом пароля',
          'Переходить по ссылкам из писем',
          'Использовать один пароль везде',
          'Хранить ПИН на карте',
        ],
        correct_answer: 'Проверять URL сайта перед вводом пароля',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 6,
    branch_id: 2,
    title: 'Социальная инженерия',
    order_index: 3,
    minigame_type: 'tinder_swipe',
    questions: [
      {
        id: 8,
        question_text: 'Звонит "сотрудник банка" и просит код из СМС. Ваши действия?',
        options: [
          'Положить трубку и перезвонить в банк',
          'Назвать код',
          'Назвать только часть кода',
          'Попросить перезвонить позже',
        ],
        correct_answer: 'Положить трубку и перезвонить в банк',
        question_type: 'minigame',
      },
    ],
  },
  // Ветка 3: Инвестиции
  {
    id: 7,
    branch_id: 3,
    title: 'Что такое инвестиции?',
    order_index: 1,
    minigame_type: 'quiz',
    questions: [
      {
        id: 9,
        question_text: 'Что такое инвестиции?',
        options: [
          'Вложение денег для получения дохода',
          'Игра в казино',
          'Кредит в банке',
          'Покупка лотерейных билетов',
        ],
        correct_answer: 'Вложение денег для получения дохода',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 8,
    branch_id: 3,
    title: 'Диверсификация',
    order_index: 2,
    minigame_type: 'quiz',
    questions: [
      {
        id: 10,
        question_text: 'Что означает "не класть все яйца в одну корзину"?',
        options: ['Диверсификация портфеля', 'Покупка акций', 'Продажа активов', 'Открытие вклада'],
        correct_answer: 'Диверсификация портфеля',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 9,
    branch_id: 3,
    title: 'Риск и доходность',
    order_index: 3,
    minigame_type: 'quiz',
    questions: [
      {
        id: 11,
        question_text: 'Какой актив обычно имеет наименьший риск?',
        options: ['Облигации государства', 'Акции стартапов', 'Криптовалюта', 'Фьючерсы'],
        correct_answer: 'Облигации государства',
        question_type: 'minigame',
      },
    ],
  },
  // Ветка 4: Налоги
  {
    id: 10,
    branch_id: 4,
    title: 'НДФЛ и вычеты',
    order_index: 1,
    minigame_type: 'quiz',
    questions: [
      {
        id: 12,
        question_text: 'Какая стандартная ставка НДФЛ в России?',
        options: ['13%', '20%', '30%', '5%'],
        correct_answer: '13%',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 11,
    branch_id: 4,
    title: 'Налоговые вычеты',
    order_index: 2,
    minigame_type: 'quiz',
    questions: [
      {
        id: 13,
        question_text: 'За что можно получить налоговый вычет?',
        options: [
          'Обучение, лечение, покупка жилья',
          'Покупка еды',
          'Оплата интернета',
          'Покупка одежды',
        ],
        correct_answer: 'Обучение, лечение, покупка жилья',
        question_type: 'minigame',
      },
    ],
  },
  // Ветка 5: Кредиты
  {
    id: 12,
    branch_id: 5,
    title: 'Что такое кредит?',
    order_index: 1,
    minigame_type: 'quiz',
    questions: [
      {
        id: 14,
        question_text: 'Что такое кредитная история?',
        options: [
          'Запись всех ваших кредитов',
          'История покупок',
          'Список банков',
          'Кредитный договор',
        ],
        correct_answer: 'Запись всех ваших кредитов',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 13,
    branch_id: 5,
    title: 'Процентная ставка',
    order_index: 2,
    minigame_type: 'quiz',
    questions: [
      {
        id: 15,
        question_text: 'Что такое ПСК (полная стоимость кредита)?',
        options: [
          'Все расходы по кредиту включая комиссии',
          'Только проценты',
          'Только сумма долга',
          'Первоначальный взнос',
        ],
        correct_answer: 'Все расходы по кредиту включая комиссии',
        question_type: 'minigame',
      },
    ],
  },
  // Ветка 6: Бизнес
  {
    id: 14,
    branch_id: 6,
    title: 'ИП vs ООО',
    order_index: 1,
    minigame_type: 'quiz',
    questions: [
      {
        id: 16,
        question_text: 'Что проще открыть начинающему предпринимателю?',
        options: ['ИП', 'ООО', 'АО', 'ПАО'],
        correct_answer: 'ИП',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 15,
    branch_id: 6,
    title: 'Системы налогообложения',
    order_index: 2,
    minigame_type: 'quiz',
    questions: [
      {
        id: 17,
        question_text: 'Что такое УСН?',
        options: [
          'Упрощённая система налогообложения',
          'Универсальный страховой номер',
          'Учётная ставка налога',
          'Услуга страховых начислений',
        ],
        correct_answer: 'Упрощённая система налогообложения',
        question_type: 'minigame',
      },
    ],
  },
  // Ветка 7: Экономика
  {
    id: 16,
    branch_id: 7,
    title: 'Инфляция',
    order_index: 1,
    minigame_type: 'quiz',
    questions: [
      {
        id: 18,
        question_text: 'Что такое инфляция?',
        options: ['Обесценивание денег', 'Рост зарплаты', 'Падение цен', 'Рост производства'],
        correct_answer: 'Обесценивание денег',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 17,
    branch_id: 7,
    title: 'Ключевая ставка',
    order_index: 2,
    minigame_type: 'quiz',
    questions: [
      {
        id: 19,
        question_text: 'Кто устанавливает ключевую ставку в России?',
        options: ['Центральный банк', 'Президент', 'Правительство', 'Минфин'],
        correct_answer: 'Центральный банк',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 18,
    branch_id: 5, // Кредиты
    title: 'Решения о кредите',
    order_index: 3,
    minigame_type: 'tinder_swipe',
    questions: [
      {
        id: 20,
        question_text: 'Банк предлагает кредит на новый iPhone с платежом 15% от зарплаты. Брать?',
        options: ['Отказаться', 'Взять кредит'],
        correct_answer: 'Отказаться',
        question_type: 'minigame',
      },
      {
        id: 21,
        question_text: 'Друг просит взять кредит на его имя под честное слово. Согласиться?',
        options: ['Отказаться', 'Согласиться'],
        correct_answer: 'Отказаться',
        question_type: 'minigame',
      },
    ],
  },
  {
    id: 19,
    branch_id: 2, // Безопасность
    title: 'Безопасные решения',
    order_index: 4,
    minigame_type: 'tinder_swipe',
    questions: [
      {
        id: 22,
        question_text: 'Незнакомец в соцсетях просит деньги на "срочное лечение". Помочь?',
        options: ['Отказаться', 'Помочь'],
        correct_answer: 'Отказаться',
        question_type: 'minigame',
      },
      {
        id: 23,
        question_text:
          'Пришло письмо от "начальника" с просьбой срочно перевести деньги на новый счёт. Выполнить?',
        options: ['Отказаться и проверить', 'Выполнить'],
        correct_answer: 'Отказаться и проверить',
        question_type: 'minigame',
      },
    ],
  },
];

interface LessonsState {
  progress: { [lessonId: number]: LessonProgress };
  completedBranches: number[];

  // Actions
  startLesson: (lessonId: number) => Lesson;
  submitAnswer: (
    lessonId: number,
    answer: string
  ) => {
    is_correct: boolean;
    mood_change: number;
    coins_earned: number;
  };
  completeLesson: (lessonId: number) => { bonus_coins: number; new_balance: number };
  isLessonAvailable: (lessonId: number) => boolean;
  getBranchProgress: (branchId: number) => { completed: number; total: number };
}

export const useLessonsStore = create<LessonsState>()(
  persist(
    (set, get) => ({
      progress: {},
      completedBranches: [],

      startLesson: (lessonId) => {
        const lesson = LESSONS.find((l) => l.id === lessonId);
        if (!lesson) throw new Error('Урок не найден');

        const { progress } = get();
        if (!progress[lessonId]) {
          set({
            progress: {
              ...progress,
              [lessonId]: {
                lesson_id: lessonId,
                status: 'in_progress',
                score: 0,
                completed_at: null,
              },
            },
          });
        }

        return lesson;
      },

      submitAnswer: (lessonId, answer) => {
        const lesson = LESSONS.find((l) => l.id === lessonId);
        if (!lesson) throw new Error('Урок не найден');

        const question = lesson.questions[0];
        const is_correct = answer === question.correct_answer;

        // Применяем штраф к настроению если неверно
        let mood_change = 0;
        if (!is_correct) {
          mood_change = -10;
          usePetStore.getState().applyPenalty(10);
        }

        // Начисляем монеты если верно
        let coins_earned = 0;
        if (is_correct) {
          // Базовые монеты
          let baseCoins = 10;

          // БОНУС +10% для приоритетных веток
          const { isPriorityBranch } = usePreferencesStore.getState();
          if (isPriorityBranch(lesson.branch_id)) {
            baseCoins = Math.round(baseCoins * 1.1); // +10%
          }

          coins_earned = baseCoins;

          const { user } = useUserStore.getState();
          if (user) {
            useUserStore.getState().updateBalance(user.liquid_balance + coins_earned);
          }
        }

        // Обновляем прогресс
        const { progress } = get();
        const currentProgress = progress[lessonId];
        if (currentProgress) {
          set({
            progress: {
              ...progress,
              [lessonId]: {
                ...currentProgress,
                score: currentProgress.score + (is_correct ? 1 : 0),
              },
            },
          });
        }

        return { is_correct, mood_change, coins_earned };
      },

      completeLesson: (lessonId) => {
        const bonus_coins = 50;
        const { user } = useUserStore.getState();
        let new_balance = user?.liquid_balance || 0;

        if (user) {
          new_balance += bonus_coins;
          useUserStore.getState().updateBalance(new_balance);
        }

        const { progress } = get();
        set({
          progress: {
            ...progress,
            [lessonId]: {
              lesson_id: lessonId,
              status: 'completed',
              score: progress[lessonId]?.score || 0,
              completed_at: new Date().toISOString(),
            },
          },
        });

        return { bonus_coins, new_balance };
      },

      isLessonAvailable: (lessonId) => {
        const lesson = LESSONS.find((l) => l.id === lessonId);
        if (!lesson) return false;

        const { progress } = get();
        const lessonsInBranch = LESSONS.filter((l) => l.branch_id === lesson.branch_id).sort(
          (a, b) => a.order_index - b.order_index
        );

        const currentIndex = lessonsInBranch.findIndex((l) => l.id === lessonId);
        if (currentIndex === 0) return true;

        const prevLesson = lessonsInBranch[currentIndex - 1];
        return progress[prevLesson.id]?.status === 'completed';
      },

      getBranchProgress: (branchId) => {
        const { progress } = get();
        const lessonsInBranch = LESSONS.filter((l) => l.branch_id === branchId);
        const completed = lessonsInBranch.filter(
          (l) => progress[l.id]?.status === 'completed'
        ).length;
        return { completed, total: lessonsInBranch.length };
      },
    }),
    {
      name: 'finsputnik-lessons-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useLessons() {
  return useLessonsStore();
}
