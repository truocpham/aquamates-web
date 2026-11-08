import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { NewEventScreen } from './components/NewEventScreen';
import { LIMITS, parseStart, validate } from './logic/eventForm';

const mockCreate = jest.fn();
jest.mock('./data/eventsApi', () => ({ createEvent: (...a: unknown[]) => mockCreate(...a) }));
jest.mock('@/features/auth/hooks/useSession', () => ({ useSession: () => ({ session: { user: { id: 'u1' } } }) }));

const setup = async (onCreated = jest.fn()) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await render(
    <QueryClientProvider client={client}>
      <NewEventScreen onCreated={onCreated} />
    </QueryClientProvider>,
  );
  return onCreated;
};
const START = 'Start time';
const type = (label: string, v: string) => fireEvent.changeText(screen.getByLabelText(label), v);
const fill = async () => {
  await type('Title', 'Sunday swim');
  await type('Description', 'Laps');
  await type('Location', 'City pool');
  await type(START, '2999-01-01 18:30');
};

beforeEach(() => jest.clearAllMocks());

test('parseStart rejects bad dates', () => {
  expect(parseStart('2999-02-30 10:00')).toBeNull();
  expect(parseStart('tomorrow')).toBeNull();
  expect(parseStart('2999-01-01 18:30')).toBeInstanceOf(Date);
});

test('validation blocks empty and past input', async () => {
  await setup();
  await fireEvent.press(screen.getByText('Create event'));
  expect(screen.getByText('Choose a category.')).toBeTruthy();
  expect(screen.getByText('Title is required.')).toBeTruthy();
  await type(START, '2000-01-01 10:00');
  expect(screen.getByText('Start time must be in the future.')).toBeTruthy();
  expect(mockCreate).not.toHaveBeenCalled();
});

test.each([
  ['Swimming', 'swimming'],
  ['Beer / social', 'beer_social'],
])('creates a %s event with its category', async (label, category) => {
  mockCreate.mockResolvedValue('e1');
  const onCreated = await setup();
  await fill();
  await fireEvent.press(screen.getByText(label));
  await fireEvent.press(screen.getByText('Create event'));
  await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ category, title: 'Sunday swim' }), 'u1'));
  await waitFor(() => expect(onCreated).toHaveBeenCalledWith('e1'));
  expect(await screen.findByText('Event created.')).toBeTruthy();
});

test('server error shown inline', async () => {
  mockCreate.mockRejectedValue(new Error('Could not create the event.'));
  await setup();
  await fill();
  await fireEvent.press(screen.getByText('Swimming'));
  await fireEvent.press(screen.getByText('Create event'));
  expect(await screen.findByText('Could not create the event.')).toBeTruthy();
});

test('validate enforces each limit', () => {
  const ok = { category: 'swimming' as const, title: 't', description: 'd', location: 'l', startsAt: '2999-01-01 18:30', notes: '' };
  expect(validate(ok)).toEqual({});
  for (const k of ['title', 'description', 'location', 'notes'] as const) {
    expect(validate({ ...ok, [k]: 'x'.repeat(LIMITS[k]) })[k]).toBeUndefined();
    expect(validate({ ...ok, [k]: 'x'.repeat(LIMITS[k] + 1) })[k]).toBe(`Too long: at most ${LIMITS[k]} characters.`);
  }
});
