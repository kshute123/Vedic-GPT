import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  // 👇 ADD IT HERE
  console.log("KEY VALUE:", process.env.OPENAI_API_KEY);
  console.log("KEY LENGTH:", process.env.OPENAI_API_KEY?.length);

  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json();
    const { message, chart } = body;

    if (!message) {
      return Response.json(
        { error: "Missing message" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a highly skilled Vedic astrologer.
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
