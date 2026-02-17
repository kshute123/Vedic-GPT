import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { chart, history, message } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert Vedic astrologer (Jyotish). Base all answers strictly on the provided birth chart data.",
      },
      {
        role: "system",
        content: `Birth Chart Data: ${JSON.stringify(chart)}`,
      },
      ...history,
      {
        role: "user",
        content: message,
      },
    ],
  });

  const reply = completion.choices[0].message;

  return new Response(JSON.stringify(reply), {
    headers: { "Content-Type": "application/json" },
  });
}
