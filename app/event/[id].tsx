import { useLocalSearchParams } from 'expo-router';

import { EventDetailScreen } from '@/features/events';
import { TopBar } from '@/shared/brand';
import { Screen } from '@/shared/ui';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen>
      <TopBar />
      <EventDetailScreen id={id} />
    </Screen>
  );
}
