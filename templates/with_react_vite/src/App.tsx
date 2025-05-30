import { useState } from 'react'
import './App.css'

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to the chat! How can I help you today?",
      sender: 'system',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                {message.text}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
      <div className="info-panel">
        <h2>Information</h2>
        <div className="info-content">
          <div className="info-section">
            <h3>About</h3>
            <p>This is a chat interface with a right panel for additional information.</p>
          </div>
          <div className="info-section">
            <h3>Features</h3>
            <ul>
              <li>Real-time messaging</li>
              <li>Message history</li>
              <li>Timestamps</li>
              <li>Responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
