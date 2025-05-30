export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface Message {
  conversation_id: number;
  text: string;
  sender: number;
  timestamp: string; // ISO string
}

export interface MessageStream {
  messages: Message[];
}
