import OpenAI from "openai";
import { execFile } from "child_process";

export const runtime = "nodejs";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const { date, time, lat, lon, message } = await req.json();

    console.log("INPUT:", { date, time, lat, lon });

    // Run Python chart generator
    const chart = await new Promise<any>((resolve, reject) => {
      execFile(
        "python3",
        [
          "chart.py",
          JSON.stringify({
            date,
            time,
            location: `${lat},${lon}`, // matches Python expectation
            timezone: "America/New_York" // replace if dynamic
          }),
        ],
        (error, stdout, stderr) => {
          if (error) {
            reject(stderr || error.message);
            return;
          }

          try {
            resolve(JSON.parse(stdout));
          } catch {
            reject("Invalid JSON returned from chart.py");
          }
        }
      );
    });

    console.log("CHART:", chart);

    const client = getOpenAIClient();

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
      JSON.stringify({
        error: error?.message || "Internal server error",
      }),
      { status: 500 }
    );
  }
}