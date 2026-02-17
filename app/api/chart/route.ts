import OpenAI from "openai";
import { exec } from "child_process";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const projectRoot = process.cwd();
    const pythonPath = "python3"; // Production-safe
    const scriptPath = path.join(projectRoot, "chart.py");

    return new Promise<Response>((resolve) => {
      exec(
        `${pythonPath} ${scriptPath} '${JSON.stringify(data)}'`,
        async (error, stdout, stderr) => {
          if (error) {
            console.error("Python error:", stderr);
            resolve(new Response(stderr, { status: 500 }));
            return;
          }

          const chartData = JSON.parse(stdout);

          // 🔮 GPT Interpretation
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert Vedic astrologer (Jyotish). Interpret charts using traditional Vedic principles.",
              },
              {
                role: "user",
                content: `Here is the birth chart data: ${JSON.stringify(
                  chartData
                )}. Provide a detailed interpretation.`,
              },
            ],
          });

          const interpretation =
            completion.choices[0].message.content;

          resolve(
            new Response(
              JSON.stringify({
                chart: chartData,
                interpretation,
              }),
              {
                headers: { "Content-Type": "application/json" },
              }
            )
          );
        }
      );
    });
  } catch (err) {
    console.error("Server error:", err);
    return new Response("Server error", { status: 500 });
  }
}
