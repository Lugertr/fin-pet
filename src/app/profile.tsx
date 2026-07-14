import { Loading } from '@/shared/ui';
import { lazy, Suspense } from 'react';

const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);

export default function ProfileRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfilePage />
    </Suspense>
  );
}
