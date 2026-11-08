import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { t, useLanguage } from '@/shared/i18n';
import { Button, Chip, Text, TextInput, spacing } from '@/shared/ui';

import { CATEGORIES, LIMITS, emptyForm, validate, type EventForm } from '../logic/eventForm';

type Props = {
  heading: string;
  submitLabel: string;
  initial?: EventForm;
  pending: boolean;
  error?: string;
  done?: string;
  onSubmit: (f: EventForm) => void;
};

export function EventFormView({ heading, submitLabel, initial = emptyForm, pending, error, done, onSubmit }: Props) {
  useLanguage();
  const [form, setForm] = useState<EventForm>(initial);
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validate(form) : {};
  const set = (k: keyof EventForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    setSubmitted(true);
    if (Object.keys(validate(form)).length) return;
    onSubmit(form);
  };

  const field = (k: Exclude<keyof EventForm, 'category'>, label: string, extra = {}) => (
    <View key={k} style={{ gap: spacing.xs }}>
      <Text variant="muted">{label}</Text>
      <TextInput accessibilityLabel={label} value={form[k]} onChangeText={set(k)} maxLength={LIMITS[k as keyof typeof LIMITS]} {...extra} />
      {errors[k] ? <Text variant="error" accessibilityRole="alert">{errors[k]}</Text> : null}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}>
      <Text variant="title">{heading}</Text>
      <Text variant="muted">{t('form.category')}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            label={form.category === c.value ? t('form.selected', { label: t(`category.${c.value}`) }) : t(`category.${c.value}`)}
            selected={form.category === c.value}
            onPress={() => setForm((f) => ({ ...f, category: c.value }))}
          />
        ))}
      </View>
      {errors.category ? <Text variant="error" accessibilityRole="alert">{errors.category}</Text> : null}
      {field('title', t('form.title'))}
      {field('description', t('form.description'), { multiline: true })}
      {field('location', t('form.location'))}
      {field('startsAt', t('form.startsAt'), { autoCapitalize: 'none' })}
      {field('notes', t('form.notes'), { multiline: true })}
      {error ? <Text variant="error" accessibilityRole="alert">{error}</Text> : null}
      {done ? <Text>{done}</Text> : null}
      <Button title={submitLabel} disabled={pending} onPress={submit} />
    </ScrollView>
  );
}
