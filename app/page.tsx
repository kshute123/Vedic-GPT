"use client";

import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const res = await fetch("/api/chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city,
        date,
        time,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setResult(`Error: ${data.error}`);
    } else {
      setResult(data.interpretation);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 600 }}>
      <h1>Vedic GPT</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Date of Birth</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Time of Birth</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Reading"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "2rem", whiteSpace: "pre-wrap" }}>
          {result}
        </div>
      )}
    </main>
  );
}

