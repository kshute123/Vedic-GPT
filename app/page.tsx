"use client";

import { useState } from "react";

export default function Home() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [chartData, setChartData] = useState<any>(null);
  const [interpretation, setInterpretation] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const generateChart = async () => {
    setLoading(true);

    const res = await fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time, location }),
    });

    const data = await res.json();

    setChartData(data.chart);
    setInterpretation(data.interpretation);

    setHistory([
      { role: "assistant", content: data.interpretation }
    ]);

    setLoading(false);
  };

  const sendMessage = async () => {
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chart: chartData,
        history,
        message,
      }),
    });

    const reply = await res.json();

    const newHistory = [
      ...history,
      { role: "user", content: message },
      reply,
    ];

    setHistory(newHistory);
    setMessage("");
    setLoading(false);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Vedic Astrology GPT</h1>

      {!chartData && (
        <div style={{ display: "flex", gap: 10 }}>
          <input type="date" onChange={(e) => setDate(e.target.value)} />
          <input type="time" onChange={(e) => setTime(e.target.value)} />
          <input
            placeholder="City"
            onChange={(e) => setLocation(e.target.value)}
          />
          <button onClick={generateChart}>
            {loading ? "Generating..." : "Generate Chart"}
          </button>
        </div>
      )}

      {chartData && (
        <>
          <h3>Conversation</h3>
          <div style={{ marginBottom: 20 }}>
            {history.map((msg, i) => (
              <div key={i}>
                <strong>{msg.role}:</strong> {msg.content}
              </div>
            ))}
          </div>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your chart..."
          />
          <button onClick={sendMessage}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </>
      )}
    </main>
  );
}
