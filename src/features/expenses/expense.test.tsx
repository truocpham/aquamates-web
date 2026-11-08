import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ExpensePanel } from './components/ExpensePanel';
import { QR_MAX_BYTES, qrFileError } from './logic/qrFile';
import { parseTotal, splitShare } from './logic/split';

let mockUser = 'u1';
let mockTotal: number | null = 100000;
const mockSavePayment = jest.fn().mockResolvedValue(undefined);
const mockSaveTotal = jest.fn().mockResolvedValue(undefined);
let mockFile: { type: string; size: number } | null = null;
jest.mock('@/features/auth/hooks/useSession', () => ({ useSession: () => ({ session: { user: { id: mockUser } } }) }));
jest.mock('@/features/auth/hooks/useMembership', () => ({ useMembership: () => ({ data: null }) }));
jest.mock('./logic/qrFile', () => ({ ...jest.requireActual('./logic/qrFile'), pickImage: () => Promise.resolve(mockFile) }));
jest.mock('./data/expensesApi', () => ({
  fetchTotal: () => Promise.resolve(mockTotal),
  fetchPayment: () => Promise.resolve({ qrUrl: 'https://x/qr.png', instructions: 'Pay Alice' }),
  saveTotal: (...a: unknown[]) => mockSaveTotal(...a),
  savePayment: (...a: unknown[]) => mockSavePayment(...a),
}));

const show = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ExpensePanel eventId="e1" creatorId="u1" going={3} />
    </QueryClientProvider>,
  );

test('split rounds up and total parsing is whole VND', () => {
  expect(splitShare(100000, 3)).toBe(33334);
  expect(splitShare(50000, 0)).toBe(50000);
  expect(parseTotal(' 120000 ')).toBe(120000);
  for (const bad of ['', '-5', '1.5', 'abc']) expect(parseTotal(bad)).toBeNull();
});

test('qr file limits match the bucket', () => {
  expect(qrFileError({ type: 'image/png', size: QR_MAX_BYTES })).toBeNull();
  expect(qrFileError({ type: 'image/png', size: QR_MAX_BYTES + 1 })).toBe('expense.qrTooBig');
  expect(qrFileError({ type: 'application/pdf', size: 10 })).toBe('expense.qrBadType');
});

test('organizer sees total and split, and a member sees the QR', async () => {
  await show();
  expect(await screen.findByText(/^Total: /)).toBeTruthy();
  expect(await screen.findByText(/^Each pays: .*\(3 going\)$/)).toBeTruthy();
  expect(await screen.findByLabelText('Bank QR')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Total cost'), '90000');
  await fireEvent.press(screen.getByText('Save cost'));
  await waitFor(() => expect(mockSaveTotal).toHaveBeenCalledWith('e1', 90000));
});

test('rejects a wrong-type or oversize file and uploads a valid one', async () => {
  await show();
  await screen.findByText('Choose QR image');
  mockFile = { type: 'application/pdf', size: 10 };
  await fireEvent.press(screen.getByText('Choose QR image'));
  expect(await screen.findByText(/not an image/)).toBeTruthy();
  mockFile = { type: 'image/png', size: QR_MAX_BYTES + 1 };
  await fireEvent.press(screen.getByText('Choose QR image'));
  expect(await screen.findByText(/larger than 2 MB/)).toBeTruthy();
  expect(screen.queryByText('QR image selected')).toBeNull();
  mockFile = { type: 'image/png', size: 100 };
  await fireEvent.press(screen.getByText('Choose QR image'));
  await fireEvent.press(await screen.findByText('QR image selected'));
  await fireEvent.press(screen.getByText('Save payment details'));
  await waitFor(() => expect(mockSavePayment).toHaveBeenCalledWith('e1', 'Pay Alice', mockFile));
});

test('non-organizer without a cost sees nothing', async () => {
  mockUser = 'u2';
  mockTotal = null;
  await show();
  await waitFor(() => expect(screen.queryByText('Cost')).toBeNull());
});
