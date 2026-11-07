import { render, screen } from '@testing-library/react-native';

import { HomeScreen } from './HomeScreen';
import { lightColors } from './theme';

test('renders the app name', async () => {
  await render(<HomeScreen />);
  expect(screen.getByText('T-MEN')).toBeTruthy();
});

test('uses the theme background', async () => {
  await render(<HomeScreen />);
  expect(screen.getByTestId('home')).toHaveStyle({ backgroundColor: lightColors.bg });
});
