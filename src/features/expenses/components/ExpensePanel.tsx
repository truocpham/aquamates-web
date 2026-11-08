import { useState } from 'react';
import { Image } from 'react-native';

import { useMembership } from '@/features/auth/hooks/useMembership';
import { useSession } from '@/features/auth/hooks/useSession';
import { formatVnd, t, useLanguage, type TextKey } from '@/shared/i18n';
import { Button, Card, Text, TextInput, size } from '@/shared/ui';

import { usePayment, useSavePayment, useSaveTotal, useTotal } from '../hooks/useExpense';
import { pickImage, qrFileError } from '../logic/qrFile';
import { parseTotal, splitShare } from '../logic/split';

export function ExpensePanel({ eventId, creatorId, going }: { eventId: string; creatorId: string | null; going: number }) {
  useLanguage();
  const { session } = useSession();
  const { data: membership } = useMembership();
  const { data: total, isError, error } = useTotal(eventId);
  const save = useSaveTotal(eventId);
  const { data: payment } = usePayment(eventId);
  const savePay = useSavePayment(eventId);
  const [instr, setInstr] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<TextKey | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [bad, setBad] = useState(false);
  const canManage = (!!creatorId && creatorId === session?.user.id) || membership?.role === 'admin';
  if (isError) return <Text variant="error" accessibilityRole="alert">{error.message}</Text>;
  if (total == null && !canManage) return null;
  const value = text ?? (total == null ? '' : String(total));
  const pick = async () => {
    const f = await pickImage();
    if (!f) return;
    const problem = qrFileError(f);
    setImageError(problem);
    setImage(problem ? null : f);
  };
  const onSavePay = () =>
    savePay.mutate(
      { instructions: instr ?? payment?.instructions ?? '', image: image ?? undefined },
      { onSuccess: () => { setInstr(null); setImage(null); } },
    );
  const onSave = () => {
    const n = parseTotal(value);
    setBad(n === null);
    if (n !== null) save.mutate(n, { onSuccess: () => setText(null) });
  };
  return (
    <Card>
      <Text variant="heading">{t('expense.cost')}</Text>
      {total != null ? <Text>{t('expense.total', { amount: formatVnd(total) })}</Text> : <Text variant="muted">{t('expense.none')}</Text>}
      {total != null ? <Text>{t('expense.each', { amount: formatVnd(splitShare(total, going)), going })}</Text> : null}
      {payment?.instructions ? <Text>{payment.instructions}</Text> : null}
      {payment?.qrUrl ? <Image accessibilityLabel={t('expense.qrAlt')} source={{ uri: payment.qrUrl }} style={{ width: size.qr, height: size.qr, alignSelf: 'center' }} /> : null}
      {canManage ? (
        <>
          <TextInput accessibilityLabel={t('expense.totalLabel')} keyboardType="number-pad" value={value} onChangeText={setText} />
          <Button title={t('expense.save')} disabled={save.isPending} onPress={onSave} />
          {bad ? <Text variant="error" accessibilityRole="alert">{t('expense.invalid')}</Text> : null}
          {total != null ? (
            <>
              <TextInput accessibilityLabel={t('expense.instructions')} multiline value={instr ?? payment?.instructions ?? ''} onChangeText={setInstr} />
              <Button title={image ? t('expense.qrSelected') : t('expense.qrChoose')} variant="secondary" onPress={pick} />
              {imageError ? <Text variant="error" accessibilityRole="alert">{t(imageError)}</Text> : null}
              <Button title={t('expense.savePayment')} disabled={savePay.isPending} onPress={onSavePay} />
              {savePay.isError ? <Text variant="error" accessibilityRole="alert">{savePay.error.message}</Text> : null}
            </>
          ) : null}
          {save.isError ? <Text variant="error" accessibilityRole="alert">{save.error.message}</Text> : null}
        </>
      ) : null}
    </Card>
  );
}
