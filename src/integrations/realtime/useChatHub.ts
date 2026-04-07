import {
  HubConnection,
  HubConnectionState,
} from '@microsoft/signalr';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChatHubCallbacks,
  ChatInviteDto,
  ChatMessageDtoWire,
  SendChatMessageDto,
} from './chatHubTypes';
import { normalizeIncomingChatMessage } from './chatHubTypes';
import { createChatSignalRConnection } from './createChatSignalRConnection';

export interface UseChatHubOptions extends ChatHubCallbacks {
  /** Quando false, não cria nem inicia a conexão. */
  enabled: boolean;
  /** Log SignalR no console (útil em desenvolvimento). */
  debug?: boolean;
}

export interface UseChatHubResult {
  connectionState: HubConnectionState;
  sendMessage: (dto: SendChatMessageDto) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  sendTyping: (roomId: string, isTyping: boolean) => Promise<void>;
}

function assertConnected(connection: HubConnection | null): asserts connection is HubConnection {
  if (!connection || connection.state !== HubConnectionState.Connected) {
    throw new Error('Hub de chat não está conectado.');
  }
}

/**
 * Gerencia `HubConnection` do chat: JWT via factory em {@link createChatSignalRConnection},
 * invocações ao servidor e eventos do cliente (`IChatHubClient`).
 */
export function useChatHub(options: UseChatHubOptions): UseChatHubResult {
  const {
    enabled,
    debug,
    onReceiveMessage,
    onReceiveTranslation,
    onTranslationFailed,
    onUserTyping,
    onMessageRead,
    onUserInvited,
  } = options;

  const handlersRef = useRef<ChatHubCallbacks>({});
  useEffect(() => {
    handlersRef.current = {
      onReceiveMessage,
      onReceiveTranslation,
      onTranslationFailed,
      onUserTyping,
      onMessageRead,
      onUserInvited,
    };
  });

  const connectionRef = useRef<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState(HubConnectionState.Disconnected);

  const syncState = useCallback((connection: HubConnection) => {
    setConnectionState(connection.state);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setConnectionState(HubConnectionState.Disconnected);
      connectionRef.current = null;
      return;
    }

    const connection = createChatSignalRConnection({
      debug: debug ?? import.meta.env.DEV,
    });

    if (!connection) {
      setConnectionState(HubConnectionState.Disconnected);
      connectionRef.current = null;
      return;
    }

    connectionRef.current = connection;

    const receiveMessage = (message: ChatMessageDtoWire) => {
      handlersRef.current.onReceiveMessage?.(normalizeIncomingChatMessage(message));
    };
    const receiveTranslation = (
      messageId: string,
      translatedText: string,
      targetLang: string
    ) => {
      handlersRef.current.onReceiveTranslation?.(
        messageId,
        translatedText,
        targetLang
      );
    };
    const userTyping = (roomId: string, userId: string, isTyping: boolean) => {
      handlersRef.current.onUserTyping?.(roomId, userId, isTyping);
    };
    const messageRead = (messageId: string, userId: string) => {
      handlersRef.current.onMessageRead?.(messageId, userId);
    };
    const userInvited = (invite: ChatInviteDto) => {
      handlersRef.current.onUserInvited?.(invite);
    };

    const translationFailed = (messageId: string) => {
      handlersRef.current.onTranslationFailed?.(messageId);
    };

    connection.on('ReceiveMessage', receiveMessage);
    connection.on('ReceiveTranslation', receiveTranslation);
    connection.on('TranslationFailed', translationFailed);
    connection.on('UserTyping', userTyping);
    connection.on('MessageRead', messageRead);
    connection.on('UserInvited', userInvited);

    const onReconnecting = () => syncState(connection);
    const onReconnected = () => syncState(connection);
    const onClose = () => syncState(connection);

    connection.onreconnecting(onReconnecting);
    connection.onreconnected(onReconnected);
    connection.onclose(onClose);

    setConnectionState(HubConnectionState.Connecting);
    void connection
      .start()
      .then(() => {
        syncState(connection);
      })
      .catch(() => {
        setConnectionState(HubConnectionState.Disconnected);
      });

    return () => {
      connection.off('ReceiveMessage', receiveMessage);
      connection.off('ReceiveTranslation', receiveTranslation);
      connection.off('TranslationFailed', translationFailed);
      connection.off('UserTyping', userTyping);
      connection.off('MessageRead', messageRead);
      connection.off('UserInvited', userInvited);
      void connection.stop();
      if (connectionRef.current === connection) {
        connectionRef.current = null;
      }
      setConnectionState(HubConnectionState.Disconnected);
    };
  }, [enabled, debug, syncState]);

  const sendMessage = useCallback(async (dto: SendChatMessageDto) => {
    assertConnected(connectionRef.current);
    await connectionRef.current.invoke('SendMessage', {
      roomId: dto.roomId,
      content: dto.content,
      sourceLang: dto.sourceLang,
    });
  }, []);

  const markAsRead = useCallback(async (messageId: string) => {
    assertConnected(connectionRef.current);
    await connectionRef.current.invoke('MarkAsRead', messageId);
  }, []);

  const sendTyping = useCallback(async (roomId: string, isTyping: boolean) => {
    assertConnected(connectionRef.current);
    await connectionRef.current.invoke('UserTyping', roomId, isTyping);
  }, []);

  return {
    connectionState,
    sendMessage,
    markAsRead,
    sendTyping,
  };
}
