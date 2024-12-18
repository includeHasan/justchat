import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '@/contexts/ChatContext';
// import type { Chat } from '@/lib/types';

export default function ChatList() {
  const { chats, activeChat, setActiveChat } = useChat();

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-2 p-4">
        {chats.map((chat) => (
          <Button
            key={chat.id}
            variant={activeChat?.id === chat.id ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveChat(chat)}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">
                {chat.participants
                  .map((participant) => participant.name)
                  .join(', ')}
              </span>
              {chat.lastMessage && (
                <>
                  <span className="text-sm text-gray-500 truncate">
                    {chat.lastMessage.content}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(chat.lastMessage.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </>
              )}
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}