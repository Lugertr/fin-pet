import { Loading } from '@/shared/ui';
import { lazy, Suspense } from 'react';

const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

export default function SettingsRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <SettingsPage />
    </Suspense>
  );
}
