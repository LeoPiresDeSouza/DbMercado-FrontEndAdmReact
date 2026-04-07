import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '../../../design-system/components/Select/Select';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import { useChat } from '../context/ChatContext';
import {
  CHAT_LANGUAGE_CODES,
  normalizarCodigoIdiomaChat,
  type ChatLanguageCode,
} from '../utils/chatLanguage';
import './LanguageSelector.css';

export function LanguageSelector(): React.ReactElement | null {
  const { t } = useTranslation('common');
  const addNotification = useNotificationCenterStore((s) => s.add);
  const {
    salaAtivaId,
    idiomaPreferidoSalaAtiva,
    definirIdiomaPreferidoNaSala,
    idiomaChatAtualizando,
  } = useChat();

  const valorSelect = useMemo((): ChatLanguageCode => {
    const atual = idiomaPreferidoSalaAtiva?.trim() ?? '';
    const canon = normalizarCodigoIdiomaChat(atual);
    return canon ?? 'pt-BR';
  }, [idiomaPreferidoSalaAtiva]);

  const onChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const roomId = salaAtivaId?.trim();
      if (!roomId) {
        return;
      }
      const code = e.target.value as ChatLanguageCode;
      if (!(CHAT_LANGUAGE_CODES as readonly string[]).includes(code)) {
        return;
      }
      try {
        await definirIdiomaPreferidoNaSala(roomId, code);
      } catch (err) {
        addNotification({
          title: t('chat.languageUpdateErrorTitle'),
          body: resolveLocalizedErrorMessage(err, t),
          severity: 'error',
        });
      }
    },
    [addNotification, definirIdiomaPreferidoNaSala, salaAtivaId, t]
  );

  if (!salaAtivaId?.trim()) {
    return null;
  }

  return (
    <div className="language-selector">
      <Select
        className="language-selector__select"
        label={t('chat.languageLabel')}
        value={valorSelect}
        disabled={idiomaChatAtualizando}
        aria-busy={idiomaChatAtualizando || undefined}
        onChange={(e) => {
          void onChange(e);
        }}
      >
        <option value="pt-BR">{t('chat.languageOptionPtBr')}</option>
        <option value="en">{t('chat.languageOptionEn')}</option>
        <option value="zh-CN">{t('chat.languageOptionZh')}</option>
      </Select>
    </div>
  );
}
