import { HubConnectionState } from '@microsoft/signalr';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../design-system/components/Button/Button';
import type { ChatMessageDto } from '../../../integrations/realtime/chatHubTypes';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import { useChat } from '../context/ChatContext';
import { LanguageSelector } from './LanguageSelector';
import { MessageBubble } from './MessageBubble';
import './ChatThreadPanel.css';

const TYPING_IDLE_MS = 2800;
const DEFAULT_SOURCE_LANG = 'pt-BR';

function localeParaIntl(language: string): string {
  if (language.startsWith('zh')) {
    return 'zh-CN';
  }
  if (language.startsWith('en')) {
    return 'en-US';
  }
  return 'pt-BR';
}

function sortMessages(map: ReadonlyMap<string, ChatMessageDto>): ChatMessageDto[] {
  return [...map.values()].sort((a, b) => {
    const ta = new Date(a.sentAt).getTime();
    const tb = new Date(b.sentAt).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) {
      return a.sentAt.localeCompare(b.sentAt);
    }
    return ta - tb;
  });
}

export function ChatThreadPanel(): React.ReactElement {
  const { t, i18n } = useTranslation('common');
  const addNotification = useNotificationCenterStore((s) => s.add);
  const {
    salaAtivaId,
    salas,
    mensagensSalaAtiva,
    enviarMensagem,
    enviarDigitando,
    idiomaPreferidoSalaAtiva,
    estadoConexaoHub,
    digitandoUserIdsNaSalaAtiva,
    usuarioChatId,
    historicoMensagensPendente,
    historicoMensagensBuscandoMais,
    historicoMensagensTemMais,
    historicoMensagensErro,
    carregarMaisHistoricoMensagens,
    marcarComoLida,
    usuariosQueLeramMensagem,
  } = useChat();

  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const scrollRestoreRef = useRef<{ prevH: number; prevT: number } | null>(null);
  const fimListaRef = useRef<HTMLDivElement | null>(null);
  const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Sala para a qual enviamos `UserTyping(true)` — precisa receber `false` na mesma sala. */
  const typingRoomRef = useRef<string | null>(null);
  const salaAnteriorRef = useRef<string | null>(null);

  const intlLocale = useMemo(() => localeParaIntl(i18n.language), [i18n.language]);

  const idiomaVisualizador = (idiomaPreferidoSalaAtiva?.trim() || DEFAULT_SOURCE_LANG).trim();

  const salaNome = useMemo(() => {
    if (!salaAtivaId) {
      return null;
    }
    return salas.find((s) => s.id === salaAtivaId)?.name ?? null;
  }, [salas, salaAtivaId]);

  const mensagensOrdenadas = useMemo(
    () => sortMessages(mensagensSalaAtiva),
    [mensagensSalaAtiva]
  );

  const ultimaMensagemId =
    mensagensOrdenadas.length > 0
      ? mensagensOrdenadas[mensagensOrdenadas.length - 1]?.messageId ?? null
      : null;

  const hubOk = estadoConexaoHub === HubConnectionState.Connected;

  const mensagensMapRef = useRef(mensagensSalaAtiva);
  mensagensMapRef.current = mensagensSalaAtiva;

  useEffect(() => {
    if (!salaAtivaId || !hubOk || !ultimaMensagemId) {
      return;
    }
    const ultima = mensagensMapRef.current.get(ultimaMensagemId);
    if (!ultima) {
      return;
    }
    const self = usuarioChatId?.trim() ?? '';
    if (self.length > 0 && ultima.senderId === self) {
      return;
    }
    const h = window.setTimeout(() => {
      void marcarComoLida(ultimaMensagemId).catch(() => {});
    }, 450);
    return () => clearTimeout(h);
  }, [salaAtivaId, ultimaMensagemId, hubOk, usuarioChatId, marcarComoLida]);

  const pararDigitandoNaSala = useCallback(
    (roomId: string | null) => {
      if (typingIdleRef.current != null) {
        clearTimeout(typingIdleRef.current);
        typingIdleRef.current = null;
      }
      const alvo = roomId?.trim();
      if (alvo && typingRoomRef.current === alvo) {
        typingRoomRef.current = null;
        void enviarDigitando(alvo, false);
      }
    },
    [enviarDigitando]
  );

  const onComposerChange = useCallback(
    (value: string) => {
      setTexto(value);
      const room = salaAtivaId?.trim();
      if (!room || estadoConexaoHub !== HubConnectionState.Connected) {
        return;
      }
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        pararDigitandoNaSala(room);
        return;
      }
      if (typingRoomRef.current !== room) {
        typingRoomRef.current = room;
        void enviarDigitando(room, true);
      }
      if (typingIdleRef.current != null) {
        clearTimeout(typingIdleRef.current);
      }
      typingIdleRef.current = setTimeout(() => {
        typingIdleRef.current = null;
        pararDigitandoNaSala(room);
      }, TYPING_IDLE_MS);
    },
    [enviarDigitando, estadoConexaoHub, pararDigitandoNaSala, salaAtivaId]
  );

  useEffect(() => {
    return () => {
      if (typingIdleRef.current != null) {
        clearTimeout(typingIdleRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const anterior = salaAnteriorRef.current;
    salaAnteriorRef.current = salaAtivaId;
    setTexto('');
    scrollRestoreRef.current = null;
    if (anterior && anterior !== salaAtivaId) {
      pararDigitandoNaSala(anterior);
    }
    if (typingIdleRef.current != null) {
      clearTimeout(typingIdleRef.current);
      typingIdleRef.current = null;
    }
  }, [pararDigitandoNaSala, salaAtivaId]);

  const historicoBuscandoMaisAnterior = useRef(false);
  useEffect(() => {
    const era = historicoBuscandoMaisAnterior.current;
    historicoBuscandoMaisAnterior.current = historicoMensagensBuscandoMais;
    if (era && !historicoMensagensBuscandoMais) {
      scrollRestoreRef.current = null;
    }
  }, [historicoMensagensBuscandoMais]);

  useLayoutEffect(() => {
    const r = scrollRestoreRef.current;
    if (r) {
      const el = scrollAreaRef.current;
      if (el) {
        const delta = el.scrollHeight - r.prevH;
        el.scrollTop = r.prevT + delta;
      }
      scrollRestoreRef.current = null;
      return;
    }
    fimListaRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [mensagensOrdenadas.length, salaAtivaId, digitandoUserIdsNaSalaAtiva.length]);

  const carregarMaisAntigas = useCallback(() => {
    const el = scrollAreaRef.current;
    if (el) {
      scrollRestoreRef.current = { prevH: el.scrollHeight, prevT: el.scrollTop };
    }
    carregarMaisHistoricoMensagens();
  }, [carregarMaisHistoricoMensagens]);

  const enviar = useCallback(async () => {
    const roomId = salaAtivaId?.trim();
    const corpo = texto.trim();
    if (!roomId || corpo.length === 0) {
      return;
    }
    if (estadoConexaoHub !== HubConnectionState.Connected) {
      addNotification({
        title: t('chat.sendErrorTitle'),
        body: t('chat.hubDisconnectedHint'),
        severity: 'warning',
      });
      return;
    }
    const sourceLang = (idiomaPreferidoSalaAtiva?.trim() || DEFAULT_SOURCE_LANG).trim();
    pararDigitandoNaSala(roomId);
    setEnviando(true);
    try {
      await enviarMensagem({ roomId, content: corpo, sourceLang });
      setTexto('');
    } catch (e) {
      addNotification({
        title: t('chat.sendErrorTitle'),
        body: resolveLocalizedErrorMessage(e, t),
        severity: 'error',
      });
    } finally {
      setEnviando(false);
    }
  }, [
    addNotification,
    enviarMensagem,
    estadoConexaoHub,
    idiomaPreferidoSalaAtiva,
    pararDigitandoNaSala,
    salaAtivaId,
    t,
    texto,
  ]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void enviar();
      }
    },
    [enviar]
  );

  const digitandoOutros = digitandoUserIdsNaSalaAtiva.length > 0;

  const selfIdTrim = usuarioChatId?.trim() ?? '';

  if (!salaAtivaId) {
    return (
      <section className="chat-thread-panel chat-thread-panel--empty" aria-label={t('chat.threadAria')}>
        <p className="chat-thread-panel__placeholder">{t('chat.selectRoomHint')}</p>
      </section>
    );
  }

  return (
    <section className="chat-thread-panel" aria-label={t('chat.threadAria')}>
      <header className="chat-thread-panel__header">
        <h2 className="chat-thread-panel__title">{salaNome ?? t('chat.roomFallbackTitle')}</h2>
        <LanguageSelector />
      </header>

      <div
        ref={scrollAreaRef}
        className="chat-thread-panel__scroll"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {historicoMensagensErro ? (
          <p className="chat-thread-panel__history-error" role="alert">
            {t('chat.historyLoadError')}
          </p>
        ) : null}
        {historicoMensagensTemMais ? (
          <div className="chat-thread-panel__load-more-wrap">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={historicoMensagensBuscandoMais}
              disabled={historicoMensagensBuscandoMais}
              onClick={() => carregarMaisAntigas()}
            >
              {t('chat.loadOlderMessages')}
            </Button>
          </div>
        ) : null}
        {historicoMensagensPendente && mensagensOrdenadas.length === 0 ? (
          <p className="chat-thread-panel__history-loading">{t('chat.historyLoading')}</p>
        ) : null}
        {!historicoMensagensPendente && mensagensOrdenadas.length === 0 ? (
          <p className="chat-thread-panel__empty-thread">{t('chat.emptyThread')}</p>
        ) : null}
        {mensagensOrdenadas.length > 0 ? (
          mensagensOrdenadas.map((m) => {
            const isOwn = Boolean(selfIdTrim && m.senderId === selfIdTrim);
            const lidaPorOutro =
              isOwn &&
              usuariosQueLeramMensagem(m.messageId).some((id) => id.trim() !== selfIdTrim);
            return (
              <MessageBubble
                key={m.messageId}
                message={m}
                isOwn={isOwn}
                timeLocale={intlLocale}
                viewerLanguagePref={idiomaVisualizador}
                lidaPorOutroParticipante={lidaPorOutro}
              />
            );
          })
        ) : null}
        {digitandoOutros ? (
          <p className="chat-thread-panel__typing" aria-live="polite">
            {digitandoUserIdsNaSalaAtiva.length === 1
              ? t('chat.someoneTyping')
              : t('chat.multipleTyping', { count: digitandoUserIdsNaSalaAtiva.length })}
          </p>
        ) : null}
        <div ref={fimListaRef} className="chat-thread-panel__scroll-anchor" />
      </div>

      <footer className="chat-thread-panel__composer">
        <div className="ds-input-field chat-thread-panel__field">
          <textarea
            className="ds-input-field__control chat-thread-panel__textarea"
            rows={3}
            value={texto}
            disabled={!hubOk || enviando}
            placeholder={t('chat.messagePlaceholder')}
            onChange={(e) => onComposerChange(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => {
              const r = salaAtivaId?.trim() ?? null;
              if (r) {
                pararDigitandoNaSala(r);
              }
            }}
            aria-label={t('chat.messagePlaceholder')}
          />
        </div>
        <Button
          type="button"
          variant="primary"
          disabled={!hubOk || enviando || texto.trim().length === 0}
          loading={enviando}
          onClick={() => void enviar()}
        >
          {t('chat.send')}
        </Button>
      </footer>
    </section>
  );
}
