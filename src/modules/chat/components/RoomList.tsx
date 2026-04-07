import { HubConnectionState } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../design-system/components/Button/Button';
import type { ChatInviteDto } from '../../../integrations/realtime/chatHubTypes';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import { useChat } from '../context/ChatContext';
import { aceitarConvite, recusarConvite } from '../services/chatInviteService';
import { formatChatRelativeTime } from '../utils/formatChatRelativeTime';
import './RoomList.css';

function hubEstadoLabel(estado: HubConnectionState, t: (k: string) => string): string {
  switch (estado) {
    case HubConnectionState.Connected:
      return t('chat.hub.connected');
    case HubConnectionState.Connecting:
    case HubConnectionState.Reconnecting:
      return t('chat.hub.connecting');
    case HubConnectionState.Disconnected:
      return t('chat.hub.disconnected');
    case HubConnectionState.Disconnecting:
      return t('chat.hub.disconnecting');
    default:
      return t('chat.hub.unknown');
  }
}

function localeParaIntl(language: string): string {
  if (language.startsWith('zh')) {
    return 'zh-CN';
  }
  if (language.startsWith('en')) {
    return 'en-US';
  }
  return 'pt-BR';
}

export function RoomList(): React.ReactElement {
  const { t, i18n } = useTranslation('common');
  const queryClient = useQueryClient();
  const addNotification = useNotificationCenterStore((s) => s.add);
  const {
    salas,
    salasCarregando,
    recarregarSalas,
    salaAtivaId,
    setSalaAtivaId,
    convitesPendentes,
    removerConvitePendente,
    estadoConexaoHub,
  } = useChat();

  const [acaoConviteId, setAcaoConviteId] = useState<string | null>(null);
  const [tipoAcao, setTipoAcao] = useState<'accept' | 'decline' | null>(null);

  const intlLocale = useMemo(() => localeParaIntl(i18n.language), [i18n.language]);

  const conviteLoading = useCallback(
    (inviteId: string, tipo: 'accept' | 'decline') =>
      acaoConviteId === inviteId && tipoAcao === tipo,
    [acaoConviteId, tipoAcao]
  );

  const onAceitar = useCallback(
    async (invite: ChatInviteDto) => {
      setAcaoConviteId(invite.id);
      setTipoAcao('accept');
      try {
        await aceitarConvite(invite.id);
        removerConvitePendente(invite.id);
        void queryClient.invalidateQueries({ queryKey: ['chat', 'invites', 'pending'] });
        recarregarSalas();
        addNotification({
          title: t('chat.inviteAcceptedTitle'),
          body: t('chat.inviteAcceptedBody', { room: invite.roomName }),
          severity: 'success',
        });
      } catch (e) {
        addNotification({
          title: t('chat.inviteActionErrorTitle'),
          body: resolveLocalizedErrorMessage(e, t),
          severity: 'error',
        });
      } finally {
        setAcaoConviteId(null);
        setTipoAcao(null);
      }
    },
    [addNotification, queryClient, recarregarSalas, removerConvitePendente, t]
  );

  const onRecusar = useCallback(
    async (invite: ChatInviteDto) => {
      setAcaoConviteId(invite.id);
      setTipoAcao('decline');
      try {
        await recusarConvite(invite.id);
        removerConvitePendente(invite.id);
        void queryClient.invalidateQueries({ queryKey: ['chat', 'invites', 'pending'] });
        addNotification({
          title: t('chat.inviteDeclinedTitle'),
          body: t('chat.inviteDeclinedBody', { room: invite.roomName }),
          severity: 'info',
        });
      } catch (e) {
        addNotification({
          title: t('chat.inviteActionErrorTitle'),
          body: resolveLocalizedErrorMessage(e, t),
          severity: 'error',
        });
      } finally {
        setAcaoConviteId(null);
        setTipoAcao(null);
      }
    },
    [addNotification, queryClient, removerConvitePendente, t]
  );

  const contagemConvites = convitesPendentes.length;

  return (
    <div className="chat-room-list">
      <div className="chat-room-list__header">
        <h1 className="chat-room-list__title">{t('chat.roomListTitle')}</h1>
        {contagemConvites > 0 ? (
          <span className="chat-room-list__badge" title={t('chat.invitesBadgeTitle')}>
            {contagemConvites}
          </span>
        ) : null}
        <span className="chat-room-list__hub" aria-live="polite">
          {hubEstadoLabel(estadoConexaoHub, t)}
        </span>
      </div>

      {contagemConvites > 0 ? (
        <section className="chat-room-list__invites" aria-label={t('chat.invitesSectionAria')}>
          <h2 className="chat-room-list__section-label">{t('chat.pendingInvites')}</h2>
          {convitesPendentes.map((inv) => (
            <div key={inv.id} className="chat-room-list__invite-card">
              <div className="chat-room-list__invite-room">{inv.roomName}</div>
              <div className="chat-room-list__invite-meta">
                {t('chat.inviteFrom', { name: inv.invitedByName })}
                {' · '}
                {t('chat.inviteExpires', {
                  val: new Date(inv.expiresAt).toLocaleString(intlLocale),
                })}
              </div>
              <div className="chat-room-list__invite-actions">
                <Button
                  size="sm"
                  variant="primary"
                  loading={conviteLoading(inv.id, 'accept')}
                  disabled={acaoConviteId !== null}
                  onClick={() => void onAceitar(inv)}
                >
                  {t('chat.inviteAccept')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={conviteLoading(inv.id, 'decline')}
                  disabled={acaoConviteId !== null}
                  onClick={() => void onRecusar(inv)}
                >
                  {t('chat.inviteDecline')}
                </Button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {salasCarregando ? (
        <p className="chat-room-list__loading">{t('chat.roomsLoading')}</p>
      ) : salas.length === 0 ? (
        <p className="chat-room-list__empty">{t('chat.roomsEmpty')}</p>
      ) : (
        <ul className="chat-room-list__rooms" aria-label={t('chat.roomsSectionAria')}>
          {salas.map((sala) => {
            const ts = sala.lastMessageAt?.trim() ?? '';
            const horario =
              ts.length === 0
                ? t('chat.noMessagesYet')
                : (() => {
                    const rel = formatChatRelativeTime(ts, intlLocale);
                    return rel.length > 0 ? rel : new Date(ts).toLocaleString(intlLocale);
                  })();
            const ativa = salaAtivaId === sala.id;
            return (
              <li key={sala.id}>
                <button
                  type="button"
                  className={`chat-room-list__room-row${ativa ? ' chat-room-list__room-row--active' : ''}`}
                  onClick={() => setSalaAtivaId(sala.id)}
                >
                  <span className="chat-room-list__room-name">{sala.name}</span>
                  <span className="chat-room-list__room-time">{horario}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
