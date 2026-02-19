import OpenAI from "openai";
import { exec } from "child_process";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { date, time, lat, lon, message } = await req.json();

  return new Promise<Response>((resolve) => {
    exec(
      `python3 chart.py '${JSON.stringify({ date, time, lat, lon })}'`,
      async (error, stdout, stderr) => {
        if (error) {
          resolve(
            new Response(
              JSON.stringify({ error: stderr }),
              { status: 500 }
            )
          );
          return;
        }

        const chart = JSON.parse(stdout);

        const completion = await client.chat.completions.create({
          model: "gpt-5.2",
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
            { role: "user", content: message || "Give full chart reading." },
          ],
        });

        resolve(
          Response.json({
            chart,
            interpretation: completion.choices[0].message.content,
          })
        );
      }
    );
  });
}