import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessageDto } from '../../../integrations/realtime/chatHubTypes';
import { idiomasChatEquivalentes } from '../utils/chatLanguage';
import './MessageBubble.css';

export interface MessageBubbleProps {
  message: ChatMessageDto;
  isOwn: boolean;
  timeLocale: string;
  /** `myLanguagePref` da sala (BCP-47). */
  viewerLanguagePref: string;
  /** Mensagem própria lida por outro membro (evento `MessageRead` no hub). */
  lidaPorOutroParticipante?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  timeLocale,
  viewerLanguagePref,
  lidaPorOutroParticipante = false,
}: MessageBubbleProps): React.ReactElement {
  const { t } = useTranslation('common');

  const timeLabel = useMemo(() => {
    const parsed = new Date(message.sentAt);
    if (Number.isNaN(parsed.getTime())) {
      return message.sentAt;
    }
    return parsed.toLocaleString(timeLocale, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    });
  }, [message.sentAt, timeLocale]);

  const mesmoIdiomaQueVisualizador = idiomasChatEquivalentes(
    message.sourceLang,
    viewerLanguagePref
  );

  const precisaTraducao = !isOwn && !mesmoIdiomaQueVisualizador;

  const mostrarTraduzindo =
    precisaTraducao &&
    message.translationStatus === 'pending' &&
    !message.isTranslated;

  const mostrarFalha =
    precisaTraducao && message.translationStatus === 'failed' && !message.isTranslated;

  return (
    <div
      className={`message-bubble${isOwn ? ' message-bubble--own' : ''}`}
      data-message-id={message.messageId}
    >
      <div className="message-bubble__shell">
        {!isOwn ? (
          <div className="message-bubble__sender">{message.senderName}</div>
        ) : null}

        <div
          className="message-bubble__body"
          aria-busy={mostrarTraduzindo ? true : undefined}
        >
          {mostrarTraduzindo ? (
            <p className="message-bubble__translating" aria-live="polite">
              <span className="message-bubble__translating-text">{t('chat.translating')}</span>
              <span className="message-bubble__dots" aria-hidden>
                <span className="message-bubble__dot" />
                <span className="message-bubble__dot" />
                <span className="message-bubble__dot" />
              </span>
            </p>
          ) : (
            <div className="message-bubble__content">{message.content}</div>
          )}

          {mostrarFalha ? (
            <p className="message-bubble__translation-failed" role="status">
              {t('chat.translationUnavailable')}
            </p>
          ) : null}
        </div>

        <div className="message-bubble__meta">
          <div className="message-bubble__time">{timeLabel}</div>
          {isOwn && lidaPorOutroParticipante ? (
            <span className="message-bubble__read-receipt" title={t('chat.messageReadReceipt')}>
              {t('chat.messageReadReceipt')}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
