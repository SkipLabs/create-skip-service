import { useState, useCallback } from "react";
import type { ApiError, Message } from "./types";
import { message_stream_url } from "../data";

export interface UseStreamResult {
  isConnected: boolean;
  isConnecting: boolean;
  error: ApiError | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

async function getStreamUrl(conversationId: number): Promise<string> {
  const url = `${message_stream_url}${String(conversationId)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to get stream URL");
  }
  return response.url;
}

export function useStream(
  conversationId: number,
  onMessage: (messages: Message[]) => void,
): UseStreamResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const connect = useCallback(async () => {
    try {
      setIsConnected(false);
      setIsConnecting(true);
      setError(null);

      const streamUrl = await getStreamUrl(conversationId);
      const source = new EventSource(streamUrl);

      source.addEventListener("init", (event: MessageEvent<string>) => {
        const streamData = JSON.parse(event.data) as [number, Message[]][];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const allMessages = streamData.flatMap(([_, msgs]) => msgs);
        onMessage(allMessages);
      });

      source.addEventListener("update", (event: MessageEvent<string>) => {
        const streamData = JSON.parse(event.data) as [number, Message[]][];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const newMessages = streamData.flatMap(([_, msgs]) => msgs);
        onMessage(newMessages);
      });

      source.onerror = (event) => {
        setError({
          message: `Stream connection error: ${event.type}`,
          status: 500,
        });
        source.close();
      };

      setEventSource(source);
      setIsConnected(true);
    } catch (err) {
      if (eventSource) {
        eventSource.close();
      }
      setEventSource(null);
      setError({
        message:
          err instanceof Error ? err.message : "Failed to connect to stream",
        status: 500,
      });
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [conversationId, onMessage, eventSource]);

  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, [eventSource]);

  return { isConnected, isConnecting, error, connect, disconnect };
}
