import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { Chat, Message } from '@/lib/types';

interface ChatContextType {
  activeChat: Chat | null;
  chats: Chat[];
  messages: Message[];
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  // const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      newSocket.on('message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!socket || !activeChat) return;

    const formData = new FormData();
    formData.append('content', content);
    if (attachments) {
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    socket.emit('message', {
      chatId: activeChat.id,
      content,
      attachments: attachments ? await uploadFiles(formData) : undefined,
    });
  };

  const uploadFiles = async (formData: FormData): Promise<string[]> => {
    const response = await fetch('http://localhost:5000/chat/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    return data.urls;
  };

  return (
    <ChatContext.Provider
      value={{
        activeChat,
        chats: [],
        messages,
        setActiveChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}