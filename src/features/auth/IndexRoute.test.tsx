import { render, screen } from '@testing-library/react-native';

import Index from '../../../app/index';

let mockStatus: 'loading' | 'signedOut' | 'signedIn' = 'signedIn';
const mockLanding = jest.fn();

jest.mock('@/features/auth/hooks/useSession', () => ({
  useSession: () => ({ status: mockStatus, signOut: jest.fn() }),
}));
jest.mock('@/features/landing/LandingScreen', () => ({
  LandingScreen: () => {
    mockLanding();
    return null;
  },
}));
jest.mock('@/shared/ui', () => ({
  ...jest.requireActual('@/shared/ui'),
  useTheme: () => ({ colors: { bg: '#000' } }),
}));
jest.mock('@/shared/ui/HomeScreen', () => {
  const { View } = jest.requireActual('react-native');
  return { HomeScreen: () => <View testID="home" /> };
});

beforeEach(() => mockLanding.mockClear());

test('loading: neutral splash, no landing, no home', async () => {
  mockStatus = 'loading';
  await render(<Index />);
  expect(screen.getByTestId('splash')).toBeTruthy();
  expect(screen.queryByTestId('home')).toBeNull();
  expect(mockLanding).not.toHaveBeenCalled();
});

test('signed in: home shows and the landing never renders', async () => {
  mockStatus = 'signedIn';
  await render(<Index />);
  expect(screen.getByTestId('home')).toBeTruthy();
  expect(mockLanding).not.toHaveBeenCalled();
});

test('signed out: the landing shows', async () => {
  mockStatus = 'signedOut';
  await render(<Index />);
  expect(mockLanding).toHaveBeenCalled();
  expect(screen.queryByTestId('home')).toBeNull();
});
