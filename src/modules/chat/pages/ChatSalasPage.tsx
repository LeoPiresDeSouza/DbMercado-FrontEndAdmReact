import React from 'react';
import { Navigate } from 'react-router-dom';
import { ChatThreadPanel } from '../components/ChatThreadPanel';
import { RoomList } from '../components/RoomList';
import { useChat } from '../context/ChatContext';
import './ChatSalasPage.css';

function ChatSalasPage(): React.ReactElement {
  const { podeAcessarChat } = useChat();

  if (!podeAcessarChat) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="chat-salas-page">
      <div className="chat-salas-page__layout">
        <aside className="chat-salas-page__sidebar">
          <RoomList />
        </aside>
        <div className="chat-salas-page__main">
          <ChatThreadPanel />
        </div>
      </div>
    </div>
  );
}

export default ChatSalasPage;
