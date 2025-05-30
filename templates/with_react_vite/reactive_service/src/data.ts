import { InitialData } from '@skipruntime/core';
import { ServiceInputs } from './types';

// Initial data for the social network service
const initialData: InitialData<ServiceInputs> = {
  users: [
    [0, [{ name: 'Bob' }]],
    [1, [{ name: 'Alice' }]],
    [2, [{ name: 'Carol' }]],
    [3, [{ name: 'Eve' }]],
  ],
  messages: [
    [
      1,
      [
        {
          conversation_id: 0,
          text: "Hello, I'm Alice, how are you?",
          sender: 1,
          timestamp: new Date().toISOString(),
        },
      ],
    ],
    [
      2,
      [
        {
          conversation_id: 0,
          text: 'I am good, thank you Alice! My name is Bob',
          sender: 0,
          timestamp: new Date().toISOString(),
        },
      ],
    ],
    [
      3,
      [
        {
          conversation_id: 0,
          text: 'My name is Carol',
          sender: 2,
          timestamp: new Date().toISOString(),
        },
      ],
    ],
    [
      4,
      [{ conversation_id: 0, text: "And I'm Eve", sender: 3, timestamp: new Date().toISOString() }],
    ],
  ],
  conversations: [
    [0, [{ members: [1, 2, 3] }]],
    [1, [{ members: [1, 2] }]],
  ],
};

const stream_url = 'http://localhost:8080/v1/streams/';

export { initialData, stream_url };
