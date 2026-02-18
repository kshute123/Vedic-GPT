"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [chart, setChart] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateChart() {
    setLoading(true);

    const res = await fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, date, time }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setMessages([{ role: "assistant", content: data.error }]);
      return;
    }

    setChart(data.chart);
    setMessages([{ role: "assistant", content: data.reply }]);
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chart,
        message: input,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setMessages([...newMessages, { role: "assistant", content: data.error }]);
      return;
    }

    setMessages([
      ...newMessages,
      { role: "assistant", content: data.reply },
    ]);
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 700, margin: "auto" }}>
      <h1>Vedic GPT</h1>

      {!chart && (
        <div style={{ marginBottom: "2rem" }}>
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button onClick={generateChart} disabled={loading}>
            {loading ? "Generating..." : "Generate Reading"}
          </button>
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: "1rem",
              padding: "0.8rem",
              borderRadius: "8px",
              background:
                msg.role === "assistant" ? "#f1f1f1" : "#d1e7ff",
            }}
          >
            <strong>{msg.role === "assistant" ? "Astrologer" : "You"}:</strong>
            <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
      </div>

      {chart && (
        <div>
          <input
            placeholder="Ask a follow-up question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: "70%" }}
          />
          <button onClick={sendMessage} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      )}
    </main>
  );
}
