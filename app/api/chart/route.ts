import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, chart } = body;

    if (!message) {
      return Response.json(
        { error: "Missing message" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // safer & stable model
      messages: [
        {
          role: "system",
          content: `
You are a highly skilled Vedic astrologer.
Interpret charts using Jyotish principles.
Chart data:
${JSON.stringify(chart || {})}
          `,
        },
        { role: "user", content: message },
      ],
    });

    return Response.json({
      content: completion.choices[0].message.content,
    });

  } catch (error: any) {
    console.error("API error:", error);
    return Response.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
