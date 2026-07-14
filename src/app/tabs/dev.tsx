import { Loading } from '@/shared/ui';
import { lazy, Suspense } from 'react';

const DebugPage = lazy(() =>
  import('@/pages/dev/DebugPage').then((m) => ({ default: m.DebugPage }))
);

export default function DevRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <DebugPage />
    </Suspense>
  );
}
