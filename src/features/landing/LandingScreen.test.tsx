import { fireEvent, render, screen } from '@testing-library/react-native';

import { LandingScreen } from './LandingScreen';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

test('shows the pitch and features', async () => {
  await render(<LandingScreen />);
  expect(screen.getByText('Your club, organised.')).toBeTruthy();
  expect(screen.getByText('Events')).toBeTruthy();
  expect(screen.getByText('Expenses')).toBeTruthy();
  expect(screen.getByText('History')).toBeTruthy();
});

test('the sign-in button goes to /sign-in', async () => {
  await render(<LandingScreen />);
  await fireEvent.press(screen.getByText('Sign in'));
  expect(mockPush).toHaveBeenCalledWith('/sign-in');
});
