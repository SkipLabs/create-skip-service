import { useState, useEffect } from "react";
import { message_stream_url } from "../data";

async function getStreamUrl(conversationId: number): Promise<string> {
  const url = `${message_stream_url}${String(conversationId)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to get stream URL");
  }
  return response.url;
}

export function useStreamUrl(
  conversationId: number,
): [string, boolean, string | null] {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getStreamUrl(conversationId)
      .then((url) => {
        setStreamUrl(url);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to get conversations stream URL");
        }
        setIsLoading(false);
      });
  }, [conversationId]);

  return [streamUrl, isLoading, error];
}
