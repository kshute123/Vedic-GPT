import { exec } from "child_process";
import path from "path";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const projectRoot = process.cwd();
    const scriptPath = path.join(projectRoot, "chart.py");

    // Run Python chart generator
    const pythonOutput: string = await new Promise((resolve, reject) => {
      exec(
        `python3 ${scriptPath} '${JSON.stringify(data)}'`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("Python error:", stderr);
            reject(stderr);
            return;
          }
          resolve(stdout);
        }
      );
    });

    // Parse Python output
    const chartData = JSON.parse(pythonOutput);

    // Initialize OpenAI ONLY inside handler (prevents build errors)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Ask GPT to interpret chart
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional Vedic astrologer. Provide deep, insightful interpretation.",
        },
        {
          role: "user",
          content: `Here is the birth chart data: ${JSON.stringify(
            chartData
          )}. Provide a detailed Vedic astrology reading.`,
        },
      ],
    });

    return new Response(
      JSON.stringify({
        chart: chartData,
        interpretation: completion.choices[0].message.content,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err }),
      { status: 500 }
    );
  }
}
