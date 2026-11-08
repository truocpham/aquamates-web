import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';

import { TopBar } from '@/shared/brand';
import { t, useLanguage } from '@/shared/i18n';
import { Avatar, Button, Card, Screen, Text, spacing } from '@/shared/ui';

import { listMembers, removeMember } from '../data/authApi';
import { useMembership } from '../hooks/useMembership';
import { useSession } from '../hooks/useSession';
import { parseRpcError } from '../logic/authLogic';

/** Admin member list with soft removal. Only active admins see it; the db enforces the same. */
export function AdminMembersScreen() {
  useLanguage();
  const myId = useSession().session?.user.id;
  const membership = useMembership();
  const isAdmin = membership.data?.role === 'admin' && membership.data.status === 'active';
  const qc = useQueryClient();
  // Inline confirm: Alert.alert does nothing on react-native-web.
  const [pending, setPending] = useState<string | null>(null);
  const members = useQuery({ queryKey: ['auth', 'members'], queryFn: listMembers, enabled: isAdmin });
  const remove = useMutation({
    mutationFn: removeMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'members'] }),
    onSettled: () => setPending(null),
  });

  return (
    <View style={{ flex: 1 }}>
      <TopBar />
      <Screen edges={[]}>
        <View style={{ gap: spacing.md, paddingVertical: spacing.lg }}>
          {membership.isPending ? null : !isAdmin ? (
            <Card>
              <Text>{t('admin.blocked')}</Text>
            </Card>
          ) : (
            <>
              <Text variant="heading" accessibilityRole="header">
                {t('admin.members')}
              </Text>
              {members.isError ? <Text variant="error">{members.error.message}</Text> : null}
              {remove.isError ? (
                <Text variant="error">{parseRpcError(remove.error) === 'last_admin' ? t('error.lastAdmin') : t('error.generic')}</Text>
              ) : null}
              {members.data?.map((m) => (
                <Card key={m.user_id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Avatar name={m.display_name} url={m.avatar_url} />
                    <Text>{`${m.display_name} (${m.status === 'removed' ? t('admin.removed') : t(`admin.role.${m.role}`)})`}</Text>
                  </View>
                  {m.status === 'active' && m.user_id !== myId ? (
                    pending === m.user_id ? (
                      <>
                        <Text variant="muted">{`${t('admin.removeTitle')} ${t('admin.removeMessage', { name: m.display_name })}`}</Text>
                        <Button title={t('common.confirm')} variant="danger" disabled={remove.isPending} onPress={() => remove.mutate(m.user_id)} />
                        <Button title={t('common.cancel')} variant="secondary" onPress={() => setPending(null)} />
                      </>
                    ) : (
                      <Button title={t('admin.remove', { name: m.display_name })} variant="danger" onPress={() => setPending(m.user_id)} />
                    )
                  ) : null}
                </Card>
              ))}
            </>
          )}
        </View>
      </Screen>
    </View>
  );
}
