import { type EagerCollection } from '@skipruntime/core';

type UserID = number;
type MessageID = number;
type ConversationID = number;

type User = { name: string };
type Message = { conversation_id: ConversationID; text: string; sender: UserID; timestamp: string };
type Conversation = { members: UserID[] };

type ServiceInputs = {
  users: EagerCollection<UserID, User>;
  messages: EagerCollection<MessageID, Message>;
  conversations: EagerCollection<ConversationID, Conversation>;
};

type ResourceInputs = {
  messages: EagerCollection<MessageID, Message>;
  conversations: EagerCollection<ConversationID, Conversation>;
};

export type {
  UserID,
  MessageID,
  ConversationID,
  User,
  Message,
  Conversation,
  ServiceInputs,
  ResourceInputs,
};
