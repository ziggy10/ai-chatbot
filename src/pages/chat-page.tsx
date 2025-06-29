import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/stores/app-store';
import { NewChatView } from '@/components/chat/new-chat-view';
import { ChatDetailView } from '@/components/chat/chat-detail-view';

export function ChatPage() {
  const { chatId } = useParams();
  const { currentChatId, setCurrentChatId, chats } = useAppStore();
  
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
    }
  }, [chatId, currentChatId, setCurrentChatId]);

  const currentChat = currentChatId ? chats.find(c => c.id === currentChatId) : null;

  if (!currentChatId || !currentChat) {
    return <NewChatView />;
  }

  return <ChatDetailView chat={currentChat} />;
}