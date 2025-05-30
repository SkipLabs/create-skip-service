import {
  type EagerCollection,
  type Json,
  type Mapper,
  type Resource,
  type Values,
} from '@skipruntime/core';

import { ResourceInputs, ConversationID, Message, MessageID, Conversation, UserID } from './types';

class ConversationByUser implements Mapper<ConversationID, Conversation, UserID, Conversation> {
  constructor(private uid: UserID) {}

  mapEntry(
    cid: ConversationID,
    values: Values<Conversation>
  ): Iterable<[ConversationID, Conversation]> {
    if (values.getUnique().members.includes(this.uid)) {
      return [[cid, values.getUnique()]];
    }
    return [];
  }
}

class Conversations implements Resource<ResourceInputs> {
  private readonly uid: UserID;

  constructor(params: Json) {
    if (typeof params != 'number') throw new Error("Missing required number parameter 'uid'");
    this.uid = params;
  }

  instantiate(inputs: ResourceInputs): EagerCollection<ConversationID, Conversation> {
    return inputs.conversations.map(ConversationByUser, this.uid);
  }
}

export { Conversations };
