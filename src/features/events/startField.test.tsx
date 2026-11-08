import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { EventFormView } from './components/EventFormView';
import { parseStart, toForm } from './logic/eventForm';

beforeEach(() => jest.replaceProperty(Platform, 'OS', 'web'));
afterEach(() => jest.restoreAllMocks());

const props = { heading: 'h', submitLabel: 'Save', pending: false };

test('web picker value submits as the local-time ISO start', async () => {
  const onSubmit = jest.fn();
  const initial = { category: 'swimming' as const, title: 't', description: 'd', location: 'l', startsAt: '', notes: '' };
  await render(<EventFormView {...props} initial={initial} onSubmit={onSubmit} />);
  expect(screen.queryByText(/YYYY/)).toBeNull();
  await fireEvent(screen.getByLabelText('Start time'), 'change', { target: { value: '2999-01-01T18:30' } });
  await fireEvent.press(screen.getByText('Save'));
  expect(parseStart(onSubmit.mock.calls[0][0].startsAt)?.toISOString()).toBe(new Date(2999, 0, 1, 18, 30).toISOString());
});

test('empty start shows the required message', async () => {
  const initial = { category: 'swimming' as const, title: 't', description: 'd', location: 'l', startsAt: '', notes: '' };
  await render(<EventFormView {...props} initial={initial} onSubmit={jest.fn()} />);
  await fireEvent.press(screen.getByText('Save'));
  expect(screen.getByText('Start time is required.')).toBeTruthy();
});

test('edit pre-fills the picker value and round-trips the same instant', () => {
  const iso = new Date(2999, 0, 1, 18, 30).toISOString();
  const f = toForm({ category: 'swimming', title: 't', description: null, location: null, starts_at: iso, notes: null });
  expect(f.startsAt).toBe('2999-01-01T18:30');
  expect(parseStart(f.startsAt)?.toISOString()).toBe(iso);
});
