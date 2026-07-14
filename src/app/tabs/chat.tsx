import { Loading } from '@/shared/ui';
import { lazy, Suspense } from 'react';

const ChatPage = lazy(() => import('@/pages/chat/ChatPage').then((m) => ({ default: m.ChatPage })));

export default function ChatRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <ChatPage />
    </Suspense>
  );
}
