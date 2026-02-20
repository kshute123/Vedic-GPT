import OpenAI from "openai";
import { exec } from "child_process";

export const runtime = "nodejs";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(req: Request) {
  try {
    const { date, time, lat, lon, message } = await req.json();

    const chart = await new Promise<any>((resolve, reject) => {
      exec(
        `python3 chart.py '${JSON.stringify({ date, time, lat, lon })}'`,
        (error, stdout, stderr) => {
          if (error) {
            reject(stderr || error.message);
            return;
          }

          try {
            resolve(JSON.parse(stdout));
          } catch {
            reject("Invalid JSON from chart.py");
          }
        }
      );
    });

    const client = getOpenAIClient(); // ← ONLY created at runtime

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a professional Vedic astrologer.
Interpret using traditional Jyotish.
Here is the natal chart:
${JSON.stringify(chart)}
          `,
        },
        {
          role: "user",
          content: message || "Give full chart reading.",
        },
      ],
    });

    return Response.json({
      chart,
      interpretation: completion.choices[0].message.content,
    });

  } catch (error: any) {
    console.error("API ERROR:", error);

    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500 }
    );
  }
}