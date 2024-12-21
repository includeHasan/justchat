import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { Chat, Message } from '@/lib/types';
import api from '@/lib/api';

interface ChatContextType {
  activeChat: Chat | null;
  chats: Chat[];
  messages: Message[];
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]); // Initialize as empty array
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_backend_url, {
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

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat]);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      // Handle the nested data structure properly
      const chatsData = response.data?.data || [];
      if (Array.isArray(chatsData)) {
        setChats(chatsData);
      } else {
        console.error('Invalid chat data format');
        setChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    }
  };

  const fetchMessages = async (chatId: string) => {
    const response = await fetch(`${import.meta.env.VITE_backend_url}/chat/${chatId}/messages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    setMessages(data);
  };

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
    const response = await fetch(`${import.meta.env.VITE_backend_url}/chat/upload`, {
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
        chats,
        messages,
        setActiveChat,
        sendMessage,
        error, // Add error to context if needed
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