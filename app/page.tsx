"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    date: "",
    time: "",
    location: "",
  });

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.text();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setResult("Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Vedic Astrology GPT</h1>

      <input
        type="date"
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />

      <br /><br />

      <input
        type="time"
        onChange={(e) => setForm({ ...form, time: e.target.value })}
      />

      <br /><br />

      <input
        placeholder="Birth location (lat,lon)"
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        {loading ? "Generating..." : "Generate Chart"}
      </button>

      <br /><br />

      <pre>{result}</pre>
    </div>
  );
}
