import "./App.css";
import Chat from "./components/Chat";
import { InfoPanel } from "./components/InfoPanel";

function App() {
  const conversationId = 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Skip Chat Template</h1>
      </header>
      <main className="app-main">
        <div className="app-content">
          <div className="chat-container">
            <Chat conversationId={conversationId} />
          </div>
          <aside className="info-container">
            <InfoPanel />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
