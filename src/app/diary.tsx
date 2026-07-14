import { Loading } from '@/shared/ui';
import { lazy, Suspense } from 'react';

const DiaryPage = lazy(() =>
  import('@/pages/diary/DiaryPage').then((m) => ({ default: m.DiaryPage }))
);

export default function DiaryRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <DiaryPage />
    </Suspense>
  );
}
