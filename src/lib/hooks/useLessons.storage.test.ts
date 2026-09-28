// lib/hooks/useLessons.storage.test.ts
// Учебный прогресс в SQLite (миграция v9): стор грузит прогресс профиля и
// каждое изменение сразу сохраняет — после перезапуска всё на месте (§4.5).
// Вместо SQLite — репозиторий в памяти.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LessonProgressState, createLessonProgress } from '@/domain/lesson/lessonProgress';
import { planForLesson } from '@/domain/lesson/LessonPlan';
import { LEGACY_LESSONS_STORE_KEY } from '@/lib/lessons/importLegacyLessonProgress';
import { useUserStore } from '@/lib/stores/userStore';
import { LESSONS, useLessonsStore, waitForLessonsLoaded } from './useLessons';

const mockRows = new Map<string, LessonProgressState>();
const mockXp = new Map<string, number>();

jest.mock('@/data/local/repositories', () => ({
  ...jest.requireActual('@/data/local/repositories'),
  getLessonProgressRepository: () => ({
    getAllForProfile: async (profileId: string) =>
      [...mockRows.entries()]
        .filter(([key]) => key.startsWith(`${profileId}:`))
        .map(([, state]) => state),
    save: async (profileId: string, state: LessonProgressState) => {
      mockRows.set(`${profileId}:${state.lessonId}`, state);
    },
    deleteAllForProfile: async () => mockRows.clear(),
    getTotalXp: async (profileId: string) => mockXp.get(profileId) ?? 0,
    saveTotalXp: async (profileId: string, totalXp: number) => {
      mockXp.set(profileId, totalXp);
    },
  }),
}));

const PROFILE = 'profile-1';
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
  mockRows.clear();
  mockXp.clear();
  await AsyncStorage.clear();
  useLessonsStore.setState({ lessonStates: {}, progress: {}, totalXp: 0, loadStatus: 'idle' });
  useUserStore.getState().setUser({
    id: PROFILE,
    username: 'Тест',
    liquid_balance: 0,
    created_at: new Date().toISOString(),
    is_demo: false,
  });
});

describe('useLessonsStore — прогресс в SQLite', () => {
  it('load читает уроки и опыт профиля', async () => {
    const lessonId = LESSONS[0].id;
    mockRows.set(`${PROFILE}:${lessonId}`, {
      ...createLessonProgress(lessonId),
      completedAt: '2026-09-20T10:00:00.000Z',
    });
    mockXp.set(PROFILE, 120);

    await useLessonsStore.getState().load(PROFILE);

    const state = useLessonsStore.getState();
    expect(state.loadStatus).toBe('loaded');
    expect(state.totalXp).toBe(120);
    expect(state.progress[lessonId]?.status).toBe('completed');
    expect(state.getBranchProgress(LESSONS[0].branch_id).completed).toBe(1);
  });

  it('открытие и завершение урока сразу сохраняются — перезапуск их не теряет', async () => {
    const lessonId = LESSONS[0].id;
    useLessonsStore.getState().startLesson(lessonId);
    await flush();
    expect(mockRows.get(`${PROFILE}:${lessonId}`)?.completedAt).toBeNull();

    useLessonsStore.getState().markLessonCompleted(lessonId);
    await flush();
    expect(mockRows.get(`${PROFILE}:${lessonId}`)?.completedAt).not.toBeNull();

    // «Перезапуск»: память пуста, прогресс читается из хранилища.
    useLessonsStore.setState({ lessonStates: {}, progress: {}, totalXp: 0, loadStatus: 'idle' });
    await useLessonsStore.getState().load(PROFILE);
    expect(useLessonsStore.getState().progress[lessonId]?.status).toBe('completed');
  });

  it('состояние урока из узлов сохраняется целиком (продолжение с того же места)', async () => {
    const saved = {
      ...createLessonProgress(LESSONS[1].id),
      readNodes: [0],
      eventPicks: { '0.1': 'x' },
    };
    useLessonsStore.getState().saveLessonState(saved);
    await flush();
    expect(mockRows.get(`${PROFILE}:${saved.lessonId}`)).toEqual(saved);
    expect(useLessonsStore.getState().progress[saved.lessonId]?.status).toBe('in_progress');
  });

  it('опыт сохраняется', async () => {
    useLessonsStore.getState().addXp(40);
    await flush();
    expect(mockXp.get(PROFILE)).toBe(40);
  });

  it('при первом запуске переносит старый прогресс из AsyncStorage', async () => {
    const lessonId = LESSONS[0].id;
    await AsyncStorage.setItem(
      LEGACY_LESSONS_STORE_KEY,
      JSON.stringify({
        state: {
          progress: {
            [lessonId]: { lesson_id: lessonId, status: 'completed', completed_at: null },
          },
          totalXp: 500,
        },
        version: 0,
      })
    );

    await useLessonsStore.getState().load(PROFILE);

    expect(useLessonsStore.getState().progress[lessonId]?.status).toBe('completed');
    expect(useLessonsStore.getState().totalXp).toBe(500);
    expect(await AsyncStorage.getItem(LEGACY_LESSONS_STORE_KEY)).toBeNull();
  });

  it('waitForLessonsLoaded ждёт окончания загрузки и не ждёт без неё', async () => {
    await expect(waitForLessonsLoaded()).resolves.toBeUndefined();

    const loading = useLessonsStore.getState().load(PROFILE);
    let waited = false;
    const wait = waitForLessonsLoaded().then(() => {
      waited = true;
    });
    expect(waited).toBe(false);
    await loading;
    await wait;
    expect(waited).toBe(true);
  });
});

describe('useLessonsStore.finishLesson — завершение урока из узлов', () => {
  it('всё пройдено — урок завершён и сохранён, повторно — не «впервые»', async () => {
    const lesson = LESSONS[0];
    const plan = planForLesson(lesson);
    let state = createLessonProgress(lesson.id);
    for (const node of plan.nodes) {
      state = { ...state, readNodes: [...state.readNodes, node.index] };
      for (const activity of node.activities) {
        state = {
          ...state,
          results: {
            ...state.results,
            [activity.id]: { completed: true, perfect: true, attempts: 1 },
          },
        };
      }
    }

    const first = useLessonsStore.getState().finishLesson(plan, state);
    await flush();
    expect(first).toMatchObject({ firstCompletion: true, firstPerfect: true });
    expect(mockRows.get(`${PROFILE}:${lesson.id}`)?.completedAt).not.toBeNull();
    expect(useLessonsStore.getState().progress[lesson.id]?.status).toBe('completed');

    const again = useLessonsStore.getState().finishLesson(plan, first.state);
    expect(again).toMatchObject({ firstCompletion: false, firstPerfect: false });
  });

  it('не всё пройдено — урок не завершается', () => {
    const lesson = LESSONS[0];
    const result = useLessonsStore
      .getState()
      .finishLesson(planForLesson(lesson), createLessonProgress(lesson.id));
    expect(result.firstCompletion).toBe(false);
    expect(useLessonsStore.getState().progress[lesson.id]?.status).toBe('in_progress');
  });
});
