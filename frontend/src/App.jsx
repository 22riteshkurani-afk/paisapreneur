import { useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  async function askAI() {
    const res = await fetch(
      `http://127.0.0.1:8000/chat?prompt=${encodeURIComponent(prompt)}`
    );

    const data = await res.json();
    setResponse(data.response);
  }

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
      <h1>🚀 Paisapreneur AI</h1>

      <textarea
        rows={6}
        style={{ width: "100%" }}
        placeholder="Ask anything..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <br />
      <br />

      <button onClick={askAI}>
        Ask AI
      </button>

      <hr />

      <h2>AI Response</h2>

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {response}
      </pre>
    </div>
  );
}

export default App;