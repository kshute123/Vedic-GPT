"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function generateChart() {
    if (!city || !date || !time) return;

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

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.error },
      ]);
      return;
    }

    setMessages([
      ...updatedMessages,
      { role: "assistant", content: data.reply },
    ]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col h-[85vh]">

        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-center">
            Vedic GPT ✨
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            AI-powered Jyotish astrology
          </p>
        </div>

        {/* Birth Form */}
        {!chart && (
          <div className="p-6 space-y-4 border-b">
            <input
              className="w-full border rounded-lg p-2"
              placeholder="City (e.g. San Francisco)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <div className="flex gap-3">
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
              onClick={generateChart}
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-700 transition"
            >
              {loading ? "Generating Reading..." : "Generate Reading"}
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === "assistant"
                  ? "bg-gray-100 self-start"
                  : "bg-indigo-600 text-white self-end ml-auto"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <div className="whitespace-pre-wrap text-sm">
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        {chart && (
          <div className="p-4 border-t flex gap-3">
            <input
              className="flex-1 border rounded-lg p-2"
              placeholder="Ask a follow-up question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 transition"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
