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

    const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chart, message: input }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setMessages([...updated, { role: "assistant", content: data.error }]);
      return;
    }

    setMessages([...updated, { role: "assistant", content: data.reply }]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 flex flex-col h-[80vh]">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Vedic GPT ✨
        </h1>

        {!chart && (
          <div className="space-y-3 mb-4">
            <input
              className="w-full border rounded-lg p-2"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 border rounded-lg p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="time"
                className="flex-1 border rounded-lg p-2"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <button
              className="w-full bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-700 transition"
              onClick={generateChart}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Reading"}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl max-w-[80%] ${
                msg.role === "assistant"
                  ? "bg-gray-100 self-start"
                  : "bg-indigo-600 text-white self-end"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {chart && (
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg p-2"
              placeholder="Ask a follow-up question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="bg-indigo-600 text-white rounded-lg px-4 hover:bg-indigo-700 transition"
              onClick={sendMessage}
              disabled={loading}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
