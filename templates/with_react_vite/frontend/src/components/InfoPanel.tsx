export function InfoPanel() {
  return (
    <div className="info-panel">
      <h2>Skip Framework Template</h2>
      <div className="info-content">
        <div className="info-section">
          <h3>About Skip</h3>
          <p>
            This template demonstrates Skip's reactive framework capabilities
            for building real-time applications. Skip provides automatic
            reactivity, efficient state management, and seamless real-time
            updates through its streaming architecture.
          </p>
        </div>
        <div className="info-section">
          <h3>Skip Features</h3>
          <ul>
            <li>Reactive state management</li>
            <li>Real-time message streaming</li>
            <li>Automatic UI updates</li>
            <li>Efficient data synchronization</li>
          </ul>
        </div>
        <div className="info-section">
          <h3>Customization Points</h3>
          <ul>
            <li>Define your reactive resources</li>
            <li>Configure Skip service endpoints</li>
            <li>Extend the reactive graph</li>
            <li>Add custom message types</li>
            <li>Implement your business logic</li>
          </ul>
        </div>
        <div className="info-section">
          <h3>Getting Started</h3>
          <p>
            Begin by configuring your Skip service in <code>data.ts</code> and
            <code>skipservice.ts</code>. Define your reactive resources and
            implement your business logic using Skip's reactive patterns.
          </p>
        </div>
      </div>
    </div>
  );
}
