import { useEffect, useState } from "react";
import { ChatMessages } from "./chat/ChatMessages";
import { MessageInput } from "./chat/MessageInput";
import { useStream } from "../api/useStream";
import type { Message } from "../api/types";
import { UserSelector } from "./chat/UserSelector";

interface ChatProps {
  conversationId: number;
}

const Chat = ({ conversationId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingError, setConnectingError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState(1);

  const updateMessages = (newMessages: Message[]) => {
    setMessages((prevMessages) => {
      const all = [...prevMessages, ...newMessages];
      const seen = new Set();
      return all.filter((msg) => {
        const key = `${String(msg.sender)}|${msg.text}|${String(msg.timestamp)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
  };

  const streamState = useStream(conversationId, (newMessages) => {
    updateMessages(newMessages);
  });

  const handleConnect = async () => {
    await streamState.connect();
  };

  const handleDisconnect = () => {
    streamState.disconnect();
    setMessages([]);
  };

  useEffect(() => {
    setIsConnecting(true);
    handleConnect()
      .then(() => {
        setConnectingError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setConnectingError(err.message);
        } else {
          setConnectingError("Unknown error");
        }
      })
      .finally(() => {
        setIsConnecting(false);
      });

    return () => {
      handleDisconnect();
    };
  }, []);

  return (
    <div className="chat-container">
      <ChatMessages user_id={selectedUserId} messages={messages} />
      <UserSelector
        selectedUserId={selectedUserId}
        onUserSelect={setSelectedUserId}
      />
      <MessageInput user_id={selectedUserId} conversationId={conversationId} />
      <div className="status-messages">
        {streamState.isConnecting && (
          <div className="status-message connecting">
            Connecting to stream...
          </div>
        )}
        {isConnecting && (
          <div className="status-message connecting">
            Connecting to stream...
          </div>
        )}
        {connectingError && (
          <div className="status-message error">
            Error connecting to stream: {connectingError}
          </div>
        )}
        {streamState.error && (
          <div className="status-message error">
            Stream Error: {streamState.error.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
