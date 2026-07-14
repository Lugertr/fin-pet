import { Loading } from '@/shared/ui';
import { lazy, Suspense } from 'react';

const AdventuresPage = lazy(() =>
  import('@/pages/adventures/AdventuresPage').then((m) => ({ default: m.AdventuresPage }))
);

export default function AdventuresRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <AdventuresPage />
    </Suspense>
  );
}
