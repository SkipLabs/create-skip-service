import { useEffect, useRef } from "react";
import type { Message } from "../../api/types";
import { initialUsers } from "../../data";

interface ChatMessagesProps {
  user_id: number;
  messages: Message[];
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function ChatMessages({ user_id, messages }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const getUserName = (userId: number): string => {
    const user = initialUsers.find((u) => u.id === userId);
    return user?.name || `User ${userId}`;
  };

  return (
    <div className="chat-messages" ref={containerRef}>
      {messages.filter(Boolean).map((message, index) => (
        <div
          key={index}
          className={`message ${message.sender === user_id ? "message-user" : "message-system"}`}
          data-sender={message.sender}
        >
          {message.sender !== user_id && (
            <div className="message-sender">{getUserName(message.sender)}</div>
          )}
          <div className="message-content">{message.text}</div>
          <div className="message-timestamp">
            {formatRelativeTime(message.timestamp)}
          </div>
        </div>
      ))}
    </div>
  );
}
