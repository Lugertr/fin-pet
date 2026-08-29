// lib/hooks/useLessons.ts
// Хуки для работы с уроками и прогрессом (с локальным хранением)

import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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

// Моковые данные веток
export const BRANCHES: Branch[] = [
  { id: 1, name: 'Бюджет', description: 'Управление доходами и расходами' },
  { id: 2, name: 'Безопасность', description: 'Защита от мошенников' },
  { id: 3, name: 'Инвестиции', description: 'Основы инвестирования' },
  { id: 4, name: 'Налоги', description: 'Налоговая грамотность' },
  { id: 5, name: 'Кредиты', description: 'Разумное использование кредитов' },
  { id: 6, name: 'Бизнес', description: 'Предпринимательство' },
  { id: 7, name: 'Экономика', description: 'Основы экономики' },
];

// Моковые данные уроков
export const LESSONS: Lesson[] = [
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
    ],
  },
  {
    id: 3,
    branch_id: 2,
    title: 'Что такое фишинг?',
    order_index: 1,
    minigame_type: 'tinder_swipe',
    questions: [
      {
        id: 4,
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
];

interface LessonsState {
  progress: { [lessonId: number]: LessonProgress };
  completedBranches: number[];

  // Actions
  startLesson: (lessonId: number) => Lesson;
  submitAnswer: (
    lessonId: number,
    answer: string
  ) => { is_correct: boolean; mood_change: number; coins_earned: number };
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

        const question = lesson.questions[0]; // Для простоты берём первый вопрос
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
          coins_earned = 10;
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
