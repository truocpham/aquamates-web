import { render, screen } from '@testing-library/react-native';

import { Avatar, initials } from './Avatar';

test('initials: first and last word, uppercase, fallback', () => {
  expect(initials('ann lee')).toBe('AL');
  expect(initials('  Bob ')).toBe('B');
  expect(initials('Mary Jane Watson')).toBe('MW');
  expect(initials('   ')).toBe('?');
});

test('shows the picture when there is a url, initials otherwise', async () => {
  await render(<Avatar name="Ann Lee" url="https://x/a.png" />);
  expect(screen.getByLabelText('Ann Lee avatar')).toBeTruthy();
  expect(screen.queryByText('AL')).toBeNull();
  await render(<Avatar name="Bob" url={null} />);
  expect(screen.getByText('B')).toBeTruthy();
});

test('non-https urls fall back to initials', async () => {
  await render(<Avatar name="Cy Dee" url="http://x/a.png" />);
  expect(screen.queryByLabelText('Cy Dee avatar')).toBeNull();
  expect(screen.getByText('CD')).toBeTruthy();
});
