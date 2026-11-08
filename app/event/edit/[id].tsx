import { useLocalSearchParams, useRouter } from 'expo-router';

import { EditEventScreen } from '@/features/events';
import { TopBar } from '@/shared/brand';
import { Screen } from '@/shared/ui';

export default function EditEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <Screen>
      <TopBar />
      <EditEventScreen id={id} onSaved={() => router.replace({ pathname: '/event/[id]', params: { id } })} />
    </Screen>
  );
}
