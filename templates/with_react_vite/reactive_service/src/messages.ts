import {
  type EagerCollection,
  type Json,
  type Mapper,
  type Resource,
  type Values,
} from '@skipruntime/core';

import { MessageID, Message, ResourceInputs, ConversationID } from './types';

class MessageByConversation implements Mapper<MessageID, Message, ConversationID, Message> {
  mapEntry(_mid: MessageID, values: Values<Message>): Iterable<[ConversationID, Message]> {
    const message = values.getUnique();
    return [[message.conversation_id, message]];
  }
}

class FilterByConversation implements Mapper<ConversationID, Message, ConversationID, Message> {
  constructor(private cid: ConversationID) {}
  mapEntry(cid: ConversationID, values: Values<Message>): Iterable<[ConversationID, Message]> {
    if (cid === this.cid) {
      return values.toArray().map((message) => [cid, message]);
    }
    return [];
  }
}

class Messages implements Resource<ResourceInputs> {
  private readonly cid: ConversationID;

  constructor(params: Json) {
    if (typeof params != 'number') throw new Error("Missing required number parameter 'cid'");
    this.cid = params;
  }

  instantiate(inputs: ResourceInputs): EagerCollection<ConversationID, Message> {
    return inputs.messages.map(MessageByConversation).map(FilterByConversation, this.cid);
  }
}

export { Messages };
