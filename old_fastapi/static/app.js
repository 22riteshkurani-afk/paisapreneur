"use client";

import { useState } from "react";

export default function Home() {
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
    <main style={{ padding: 40 }}>
      <h1>Paisapreneur AI 🚀</h1>

      <textarea
        rows={6}
        style={{ width: "100%" }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask anything..."
      />

      <br />
      <br />

      <button onClick={askAI}>Ask AI</button>

      <hr />

      <h2>Response</h2>

      <pre>{response}</pre>
    </main>
  );
}