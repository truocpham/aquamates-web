import { render, screen } from '@testing-library/react-native';

import { Button, Card, Chip, Text, TextInput } from '.';

test('shared blocks render with theme values', async () => {
  await render(
    <Card>
      <Text>hello</Text>
      <Button title="Go" onPress={() => {}} />
      <Chip label="All" selected onPress={() => {}} />
      <TextInput placeholder="code" />
    </Card>,
  );
  expect(screen.getByText('hello')).toBeTruthy();
  expect(screen.getByText('Go')).toBeTruthy();
  expect(screen.getByPlaceholderText('code')).toBeTruthy();
});
