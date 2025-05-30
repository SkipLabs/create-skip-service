import { useState, useCallback } from "react";
import type { ApiError, Message } from "./types";
import { message_stream_url } from "../data";

export interface UsePostMessageResult {
  isLoading: boolean;
  error: ApiError | null;
  postMessage: (id: number, message: Message) => Promise<void>;
}

export function usePostMessage(): UsePostMessageResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const postMessage = useCallback(
    async (id: number, message: Message): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const url = `${message_stream_url}${String(id)}`;
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });

        if (!response.ok) {
          throw new Error("Failed to post message");
        }
      } catch (err) {
        setError({
          message:
            err instanceof Error ? err.message : "Failed to post message",
          status: err instanceof Response ? err.status : undefined,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { isLoading, error, postMessage };
}
