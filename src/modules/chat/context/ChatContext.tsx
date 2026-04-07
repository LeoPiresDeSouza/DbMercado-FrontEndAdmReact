import { HubConnectionState } from '@microsoft/signalr';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type { ChatInviteDto, ChatMessageDto } from '../../../integrations/realtime/chatHubTypes';
import { useChatHub } from '../../../integrations/realtime/useChatHub';
import { authService } from '../../auth/services/authService';
import { putChatMemberLanguage } from '../services/chatMemberService';
import {
  CHAT_MESSAGES_PAGE_SIZE,
  fetchChatMessagesPage,
} from '../services/chatMessageService';
import { fetchConvitesPendentes } from '../services/chatInviteService';
import { fetchChatRooms } from '../services/chatRoomService';
import { useAuthStore } from '../../../shared/stores/authStore';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import type { ChatRoomDto } from '../types/chatTypes';
import {
  ChatMultilinguePermissao,
  usuarioTemPermissaoChatMultilingue,
} from '../utils/chatPermissoes';
import { idiomasChatEquivalentes } from '../utils/chatLanguage';
import { readUserIdFromAccessToken } from '../../../shared/utils/jwtPayload';
import i18n from '../../../shared/i18n/i18n';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';

interface ChatState {
  activeRoomId: string | null;
  byRoom: Record<string, Record<string, ChatMessageDto>>;
  messageRoomIndex: Record<string, string>;
  pendingInvites: ChatInviteDto[];
  /** Por sala: conjunto de `userId` que estão com indicador de digitação ativo (evento SignalR). */
  typingByRoom: Record<string, Record<string, true>>;
  /** `messageId` → usuários (Identity id) que registraram leitura via hub `MessageRead`. */
  readByMessage: Record<string, Record<string, true>>;
}

const initialChatState: ChatState = {
  activeRoomId: null,
  byRoom: {},
  messageRoomIndex: {},
  pendingInvites: [],
  typingByRoom: {},
  readByMessage: {},
};

/** Mescla mensagem já recebida pelo hub com o mesmo id vindo do REST (histórico / novo idioma). */
function mergeHubComHistorico(
  live: ChatMessageDto | undefined,
  history: ChatMessageDto
): ChatMessageDto {
  if (!live) {
    return history;
  }

  const rank = (s: ChatMessageDto['translationStatus']): number =>
    s === 'done' ? 2 : s === 'failed' ? 1 : 0;

  const rLive = rank(live.translationStatus);
  const rHist = rank(history.translationStatus);

  if (rHist > rLive) {
    return history;
  }
  if (rLive > rHist) {
    return live;
  }

  if (history.translationStatus === 'done' && live.translationStatus === 'done') {
    return history;
  }

  return live;
}

type ChatAction =
  | { type: 'RESET' }
  | { type: 'SET_ACTIVE_ROOM'; roomId: string | null }
  | { type: 'RECEIVE_MESSAGE'; message: ChatMessageDto }
  | {
      type: 'RECEIVE_TRANSLATION';
      messageId: string;
      translatedText: string;
      targetLang: string;
      rooms: ChatRoomDto[];
    }
  | { type: 'TRANSLATION_FAILED'; messageId: string }
  | { type: 'USER_INVITED'; invite: ChatInviteDto }
  | { type: 'SET_PENDING_INVITES'; invites: ChatInviteDto[] }
  | { type: 'REMOVE_INVITE'; inviteId: string }
  | { type: 'USER_TYPING'; roomId: string; userId: string; isTyping: boolean }
  | { type: 'MERGE_ROOM_MESSAGES_FROM_HISTORY'; roomId: string; messages: ChatMessageDto[] }
  | { type: 'MESSAGE_READ'; messageId: string; userId: string };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'RESET':
      return initialChatState;
    case 'SET_ACTIVE_ROOM':
      return { ...state, activeRoomId: action.roomId };
    case 'RECEIVE_MESSAGE': {
      const message = action.message;
      const roomId = message.roomId?.trim();
      if (!roomId) {
        return state;
      }
      const prevRoom = state.byRoom[roomId] ?? {};
      return {
        ...state,
        messageRoomIndex: {
          ...state.messageRoomIndex,
          [message.messageId]: roomId,
        },
        byRoom: {
          ...state.byRoom,
          [roomId]: { ...prevRoom, [message.messageId]: message },
        },
      };
    }
    case 'RECEIVE_TRANSLATION': {
      const roomId = state.messageRoomIndex[action.messageId];
      if (!roomId) {
        return state;
      }
      const room = action.rooms.find((r) => r.id === roomId);
      if (!room || !idiomasChatEquivalentes(room.myLanguagePref, action.targetLang)) {
        return state;
      }
      const prevMsg = state.byRoom[roomId]?.[action.messageId];
      if (!prevMsg) {
        return state;
      }
      const updated: ChatMessageDto = {
        ...prevMsg,
        content: action.translatedText,
        isTranslated: true,
        translationStatus: 'done',
      };
      const prevRoomMap = state.byRoom[roomId] ?? {};
      return {
        ...state,
        byRoom: {
          ...state.byRoom,
          [roomId]: { ...prevRoomMap, [action.messageId]: updated },
        },
      };
    }
    case 'TRANSLATION_FAILED': {
      const roomId = state.messageRoomIndex[action.messageId];
      if (!roomId) {
        return state;
      }
      const prevMsg = state.byRoom[roomId]?.[action.messageId];
      if (!prevMsg) {
        return state;
      }
      if (prevMsg.translationStatus === 'failed') {
        return state;
      }
      const prevRoomMap = state.byRoom[roomId] ?? {};
      return {
        ...state,
        byRoom: {
          ...state.byRoom,
          [roomId]: {
            ...prevRoomMap,
            [action.messageId]: { ...prevMsg, translationStatus: 'failed' },
          },
        },
      };
    }
    case 'USER_INVITED': {
      if (state.pendingInvites.some((i) => i.id === action.invite.id)) {
        return state;
      }
      return {
        ...state,
        pendingInvites: [...state.pendingInvites, action.invite],
      };
    }
    case 'SET_PENDING_INVITES':
      return { ...state, pendingInvites: action.invites };
    case 'REMOVE_INVITE': {
      return {
        ...state,
        pendingInvites: state.pendingInvites.filter((i) => i.id !== action.inviteId),
      };
    }
    case 'USER_TYPING': {
      const room = action.roomId?.trim();
      const uid = action.userId?.trim();
      if (!room || !uid) {
        return state;
      }
      const prevRoomMap = { ...(state.typingByRoom[room] ?? {}) };
      if (action.isTyping) {
        prevRoomMap[uid] = true;
      } else {
        delete prevRoomMap[uid];
      }
      const nextTyping = { ...state.typingByRoom };
      if (Object.keys(prevRoomMap).length === 0) {
        delete nextTyping[room];
      } else {
        nextTyping[room] = prevRoomMap;
      }
      return { ...state, typingByRoom: nextTyping };
    }
    case 'MERGE_ROOM_MESSAGES_FROM_HISTORY': {
      const roomId = action.roomId.trim();
      if (!roomId) {
        return state;
      }
      const prevRoom = state.byRoom[roomId] ?? {};
      const nextRoom: Record<string, ChatMessageDto> = {};
      const nextIndex = { ...state.messageRoomIndex };

      for (const msg of action.messages) {
        const id = msg.messageId;
        nextRoom[id] = mergeHubComHistorico(prevRoom[id], msg);
        nextIndex[id] = roomId;
      }

      for (const [id, hubMsg] of Object.entries(prevRoom)) {
        if (!nextRoom[id]) {
          nextRoom[id] = hubMsg;
          nextIndex[id] = roomId;
        }
      }

      return {
        ...state,
        messageRoomIndex: nextIndex,
        byRoom: { ...state.byRoom, [roomId]: nextRoom },
      };
    }
    case 'MESSAGE_READ': {
      const mid = action.messageId?.trim();
      const uid = action.userId?.trim();
      if (!mid || !uid) {
        return state;
      }
      const prevReaders = state.readByMessage[mid] ?? {};
      if (prevReaders[uid]) {
        return state;
      }
      return {
        ...state,
        readByMessage: {
          ...state.readByMessage,
          [mid]: { ...prevReaders, [uid]: true },
        },
      };
    }
    default:
      return state;
  }
}

export interface ChatContextValue {
  podeAcessarChat: boolean;
  salas: ChatRoomDto[];
  salasCarregando: boolean;
  recarregarSalas: () => void;
  salaAtivaId: string | null;
  setSalaAtivaId: (roomId: string | null) => void;
  /** Mensagens apenas da sala ativa (por `messageId`). */
  mensagensSalaAtiva: ReadonlyMap<string, ChatMessageDto>;
  estadoConexaoHub: HubConnectionState;
  enviarMensagem: ReturnType<typeof useChatHub>['sendMessage'];
  marcarComoLida: ReturnType<typeof useChatHub>['markAsRead'];
  enviarDigitando: ReturnType<typeof useChatHub>['sendTyping'];
  /** `myLanguagePref` da sala ativa na lista de salas (BCP-47). */
  idiomaPreferidoSalaAtiva: string | null;
  /** IDs de outros usuários digitando na sala ativa (exclui o usuário logado). */
  digitandoUserIdsNaSalaAtiva: readonly string[];
  /** ID Identity do usuário logado (JWT), para alinhar bolhas “próprias”. */
  usuarioChatId: string | null;
  convitesPendentes: ChatInviteDto[];
  removerConvitePendente: (inviteId: string) => void;
  /** Atualiza o idioma preferido do membro na sala (API + cache da lista de salas). */
  definirIdiomaPreferidoNaSala: (roomId: string, languagePref: string) => Promise<void>;
  idiomaChatAtualizando: boolean;
  /** Primeira página do histórico REST da sala ativa (sem cache ainda). */
  historicoMensagensPendente: boolean;
  /** Carregando página adicional do histórico (mais antigas). */
  historicoMensagensBuscandoMais: boolean;
  historicoMensagensTemMais: boolean;
  historicoMensagensErro: boolean;
  carregarMaisHistoricoMensagens: () => void;
  /** Usuários (Identity id) que registraram leitura da mensagem via SignalR `MessageRead`. */
  usuariosQueLeramMensagem: (messageId: string) => readonly string[];
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const modulos = useModulosUsuarioStore((s) => s.modulos);
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  const autenticado = authService.isAuthenticated();
  const podeAcessarChat =
    autenticado &&
    modulos !== null &&
    usuarioTemPermissaoChatMultilingue(modulos, ChatMultilinguePermissao.acessar);

  const queryClient = useQueryClient();

  const { data: salas = [], isLoading: salasCarregando, refetch } = useQuery({
    queryKey: ['chat', 'rooms', sessionRevision],
    queryFn: fetchChatRooms,
    enabled: podeAcessarChat,
  });

  const { data: convitesPendentesApi } = useQuery({
    queryKey: ['chat', 'invites', 'pending', sessionRevision],
    queryFn: fetchConvitesPendentes,
    enabled: podeAcessarChat,
  });

  const idiomaMutation = useMutation({
    mutationFn: async (vars: { roomId: string; languagePref: string }) => {
      await putChatMemberLanguage(vars.roomId, vars.languagePref);
      return vars;
    },
    onSuccess: (vars) => {
      queryClient.setQueryData<ChatRoomDto[]>(['chat', 'rooms', sessionRevision], (old) => {
        if (!old) {
          return old;
        }
        return old.map((r) =>
          r.id === vars.roomId ? { ...r, myLanguagePref: vars.languagePref } : r
        );
      });
      void queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', sessionRevision, vars.roomId],
      });
    },
  });

  const definirIdiomaPreferidoNaSala = useCallback(
    async (roomId: string, languagePref: string) => {
      await idiomaMutation.mutateAsync({ roomId, languagePref });
    },
    [idiomaMutation]
  );

  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  const salaAtivaId = state.activeRoomId?.trim() ?? null;

  const mensagensHistoricoQuery = useInfiniteQuery({
    queryKey: ['chat', 'messages', sessionRevision, salaAtivaId],
    queryFn: async ({ pageParam }) => {
      if (!salaAtivaId) {
        throw new Error('Sala não selecionada.');
      }
      return fetchChatMessagesPage(salaAtivaId, pageParam, CHAT_MESSAGES_PAGE_SIZE);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const carregadas = allPages.reduce((acc, p) => acc + p.items.length, 0);
      if (carregadas >= lastPage.totalCount) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    enabled: podeAcessarChat && Boolean(salaAtivaId),
  });

  useEffect(() => {
    if (!salaAtivaId || !mensagensHistoricoQuery.data) {
      return;
    }
    const itens = mensagensHistoricoQuery.data.pages.flatMap((p) => p.items);
    dispatch({
      type: 'MERGE_ROOM_MESSAGES_FROM_HISTORY',
      roomId: salaAtivaId,
      messages: itens,
    });
  }, [salaAtivaId, mensagensHistoricoQuery.data]);

  useEffect(() => {
    if (!podeAcessarChat) {
      dispatch({ type: 'RESET' });
    }
  }, [podeAcessarChat]);

  useEffect(() => {
    if (podeAcessarChat && convitesPendentesApi !== undefined) {
      dispatch({ type: 'SET_PENDING_INVITES', invites: convitesPendentesApi });
    }
  }, [podeAcessarChat, convitesPendentesApi]);

  const salasRef = useRef(salas);
  salasRef.current = salas;

  const onReceiveMessage = useCallback((message: ChatMessageDto) => {
    dispatch({ type: 'RECEIVE_MESSAGE', message });
  }, []);

  const onReceiveTranslation = useCallback(
    (messageId: string, translatedText: string, targetLang: string) => {
      dispatch({
        type: 'RECEIVE_TRANSLATION',
        messageId,
        translatedText,
        targetLang,
        rooms: salasRef.current,
      });
    },
    []
  );

  const onTranslationFailed = useCallback((messageId: string) => {
    dispatch({ type: 'TRANSLATION_FAILED', messageId });
  }, []);

  const onUserInvited = useCallback(
    (invite: ChatInviteDto) => {
      dispatch({ type: 'USER_INVITED', invite });
      void queryClient.invalidateQueries({ queryKey: ['chat', 'invites', 'pending'] });
      useNotificationCenterStore.getState().add({
        title: i18n.t('chat.inviteToastTitle'),
        body: i18n.t('chat.inviteToastBody', { room: invite.roomName }),
        severity: 'info',
      });
    },
    [queryClient]
  );

  const onMessageRead = useCallback((messageId: string, userId: string) => {
    dispatch({ type: 'MESSAGE_READ', messageId, userId });
  }, []);

  const onUserTyping = useCallback(
    (roomId: string, userId: string, isTyping: boolean) => {
      dispatch({ type: 'USER_TYPING', roomId, userId, isTyping });
    },
    []
  );

  const hub = useChatHub({
    enabled: podeAcessarChat,
    onReceiveMessage,
    onReceiveTranslation,
    onTranslationFailed,
    onUserTyping,
    onMessageRead,
    onUserInvited,
  });

  const setSalaAtivaId = useCallback((roomId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_ROOM', roomId });
  }, []);

  const removerConvitePendente = useCallback((inviteId: string) => {
    dispatch({ type: 'REMOVE_INVITE', inviteId });
  }, []);

  const recarregarSalas = useCallback(() => {
    void refetch();
  }, [refetch]);

  const mensagensSalaAtiva = useMemo(() => {
    const id = state.activeRoomId;
    if (!id) {
      return new Map<string, ChatMessageDto>();
    }
    const rec = state.byRoom[id] ?? {};
    return new Map(Object.entries(rec));
  }, [state.activeRoomId, state.byRoom]);

  const carregarMaisHistoricoMensagens = useCallback(() => {
    void mensagensHistoricoQuery.fetchNextPage();
  }, [mensagensHistoricoQuery]);

  const idiomaPreferidoSalaAtiva = useMemo(() => {
    if (!state.activeRoomId) {
      return null;
    }
    return salas.find((s) => s.id === state.activeRoomId)?.myLanguagePref ?? null;
  }, [salas, state.activeRoomId]);

  const usuarioChatId = useMemo(
    () => readUserIdFromAccessToken(authService.getAuthToken()),
    [sessionRevision, podeAcessarChat]
  );

  const digitandoUserIdsNaSalaAtiva = useMemo(() => {
    const roomId = state.activeRoomId?.trim();
    if (!roomId) {
      return [];
    }
    const map = state.typingByRoom[roomId] ?? {};
    const self = usuarioChatId?.trim() ?? '';
    return Object.keys(map).filter((id) => id.length > 0 && id !== self);
  }, [state.activeRoomId, state.typingByRoom, usuarioChatId]);

  const usuariosQueLeramMensagem = useCallback(
    (messageId: string) => {
      const map = state.readByMessage[messageId.trim()];
      return map ? Object.keys(map) : [];
    },
    [state.readByMessage]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      podeAcessarChat,
      salas,
      salasCarregando,
      recarregarSalas,
      salaAtivaId: state.activeRoomId,
      setSalaAtivaId,
      mensagensSalaAtiva,
      estadoConexaoHub: hub.connectionState,
      enviarMensagem: hub.sendMessage,
      marcarComoLida: hub.markAsRead,
      enviarDigitando: hub.sendTyping,
      idiomaPreferidoSalaAtiva,
      digitandoUserIdsNaSalaAtiva,
      usuarioChatId,
      convitesPendentes: state.pendingInvites,
      removerConvitePendente,
      definirIdiomaPreferidoNaSala,
      idiomaChatAtualizando: idiomaMutation.isPending,
      historicoMensagensPendente: mensagensHistoricoQuery.isPending,
      historicoMensagensBuscandoMais: mensagensHistoricoQuery.isFetchingNextPage,
      historicoMensagensTemMais: Boolean(mensagensHistoricoQuery.hasNextPage),
      historicoMensagensErro: mensagensHistoricoQuery.isError,
      carregarMaisHistoricoMensagens,
      usuariosQueLeramMensagem,
    }),
    [
      podeAcessarChat,
      salas,
      salasCarregando,
      recarregarSalas,
      state.activeRoomId,
      state.pendingInvites,
      setSalaAtivaId,
      mensagensSalaAtiva,
      hub.connectionState,
      hub.sendMessage,
      hub.markAsRead,
      hub.sendTyping,
      idiomaPreferidoSalaAtiva,
      digitandoUserIdsNaSalaAtiva,
      usuarioChatId,
      removerConvitePendente,
      definirIdiomaPreferidoNaSala,
      idiomaMutation.isPending,
      mensagensHistoricoQuery.isPending,
      mensagensHistoricoQuery.isFetchingNextPage,
      mensagensHistoricoQuery.hasNextPage,
      mensagensHistoricoQuery.isError,
      carregarMaisHistoricoMensagens,
      usuariosQueLeramMensagem,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat deve ser usado dentro de ChatProvider.');
  }
  return ctx;
}
