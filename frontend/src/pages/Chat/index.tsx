// import { useEffect } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ChatList from './ChatList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChat } from '@/contexts/ChatContext';

function ChatContent() {
  const { activeChat } = useChat();

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r">
        <ChatList />
      </div>
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b">
              <h2 className="font-semibold">
                {activeChat.participants.map((p) => p.name).join(', ')}
              </h2>
            </div>
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  return (
    <ChatProvider>
      <DashboardLayout>
        <ChatContent />
      </DashboardLayout>
    </ChatProvider>
  );
}