import { render, screen } from '@testing-library/react-native';

import { HomeScreen } from './HomeScreen';
import { lightColors } from './theme';

test('renders the app name', async () => {
  await render(<HomeScreen />);
  expect(screen.getAllByText('T-MEN').length).toBe(2);
});

test('uses the theme background', async () => {
  await render(<HomeScreen />);
  expect(screen.getByTestId('home')).toHaveStyle({ backgroundColor: lightColors.bg });
});

test('renders children in place of the placeholder', async () => {
  const { Text } = require('react-native');
  await render(<HomeScreen><Text>events here</Text></HomeScreen>);
  expect(screen.getByText('events here')).toBeTruthy();
});
