import { runService } from '@skipruntime/server';
import { SkipServiceBroker } from '@skipruntime/helpers';

import { ResourceInputs, ServiceInputs } from './types';
import { initialData } from './data.js';
import { Messages } from './messages.js';
import { Conversations } from './conversations.js';

// Service configuration and reactive graph definition
const service = {
  initialData,
  resources: { conversations: Conversations, messages: Messages },
  createGraph(input: ServiceInputs): ResourceInputs {
    const users = input.users;
    const messages = input.messages;
    const conversations = input.conversations;
    return { messages, conversations };
  },
};

// Start the reactive service with specified ports
const server = await runService(service, {
  streaming_port: 8080,
  control_port: 8081,
  no_cors: false,
});

// Initialize the service broker for client communication
const serviceBroker = new SkipServiceBroker({
  host: 'localhost',
  control_port: 8081,
  streaming_port: 8080,
});

export { server, serviceBroker };
