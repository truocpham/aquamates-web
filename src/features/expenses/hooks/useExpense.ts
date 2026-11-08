import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchPayment, fetchTotal, savePayment, saveTotal } from '../data/expensesApi';

export const usePayment = (eventId: string) =>
  useQuery({ queryKey: ['expenses', eventId, 'payment'], queryFn: () => fetchPayment(eventId) });

export function useSavePayment(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { instructions: string; image?: File }) => savePayment(eventId, v.instructions, v.image),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', eventId] }),
  });
}

export const useTotal = (eventId: string) =>
  useQuery({ queryKey: ['expenses', eventId], queryFn: () => fetchTotal(eventId) });

export function useSaveTotal(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (total: number) => saveTotal(eventId, total),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', eventId] }),
  });
}
