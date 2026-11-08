import { useRouter } from 'expo-router';

import { NewEventScreen } from '@/features/events';
import { TopBar } from '@/shared/brand';
import { Screen } from '@/shared/ui';

export default function NewEvent() {
  const router = useRouter();
  return (
    <Screen>
      <TopBar />
      <NewEventScreen onCreated={(id) => router.replace({ pathname: '/event/[id]', params: { id } })} />
    </Screen>
  );
}
