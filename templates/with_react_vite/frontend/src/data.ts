/**
 * TEMPLATE CONFIGURATION
 *
 * This file serves as a template for your chat application configuration.
 * To use this in your project:
 * 1. Configure your users with their actual IDs and names
 * 2. Set the message_stream_url to your backend endpoint
 * 3. Implement your user management system
 * 4. Add any additional user properties you need
 */

interface User {
  id: number;
  name: string;
}

// Template users - Configure with your actual users
const initialUsers: User[] = [
  { id: 0, name: "Bob" },
  { id: 1, name: "Alice" },
  { id: 2, name: "Carol" },
  { id: 3, name: "Eve" },
];

// Template backend URL - Set to your actual backend endpoint
const message_stream_url = "http://localhost:8082/messages/";

export { initialUsers, type User, message_stream_url };
