import { useRef, useEffect, useState } from "react";
import {
  usePostMessage,
  type UsePostMessageResult,
} from "../../api/usePostMessage";
import type { Message } from "../../api/types";

interface MessageInputProps {
  user_id: number;
  conversationId: number;
  onMessageSent?: () => void;
}

export function MessageInput({
  user_id,
  conversationId,
  onMessageSent,
}: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const postMessageResult: UsePostMessageResult = usePostMessage();
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, inputRef]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisabled(true);
    if (!newMessage.trim()) {
      setDisabled(false);
      return;
    }

    const message: Message = {
      conversation_id: conversationId,
      text: newMessage,
      sender: user_id,
      timestamp: new Date().toISOString(),
    };

    void postMessageResult
      .postMessage(Math.floor(Date.now() / 1000), message)
      .then(() => {
        setNewMessage("");
        onMessageSent?.();
      })
      .finally(() => {
        setDisabled(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="message-input" data-user={user_id}>
      <input
        ref={inputRef}
        type="text"
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
        }}
        placeholder="Type your message..."
        disabled={disabled || postMessageResult.isLoading}
      />
      <button type="submit" disabled={disabled || postMessageResult.isLoading}>
        Send
      </button>
      {postMessageResult.error && (
        <div className="status-message error">
          Post Error: {postMessageResult.error.message}
        </div>
      )}
    </form>
  );
}
