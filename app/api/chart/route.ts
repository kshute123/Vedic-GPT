import OpenAI from "openai";
// @ts-ignore
import tzlookup from "tz-lookup";
import { spawn } from "child_process";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function geocodeCity(city: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`,
    { headers: { "User-Agent": "vedic-gpt-app" } }
  );

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("City not found");
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { city, date, time, message, chart } = body;

    let chartData = chart;

    // Generate chart if not already generated
    if (!chartData) {
      if (!city || !date || !time) {
        return Response.json(
          { error: "Missing city, date, or time" },
          { status: 400 }
        );
      }

      const { lat, lon } = await geocodeCity(city);
      const timezone = tzlookup(lat, lon);

      const pythonPayload = JSON.stringify({
        date,
        time,
        location: `${lat},${lon}`,
        timezone,
      });

      chartData = await new Promise((resolve, reject) => {
        const python = spawn("python3", ["./chart.py", pythonPayload]);

        let stdout = "";
        let stderr = "";

        python.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        python.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        python.on("close", (code) => {
          if (code !== 0) {
            reject(stderr);
          } else {
            resolve(JSON.parse(stdout));
          }
        });
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a highly skilled Vedic astrologer.
Always use the chart data below for context.

Chart data:
${JSON.stringify(chartData)}
          `,
        },
        {
          role: "user",
          content:
            message ||
            "Provide a full Vedic astrology interpretation of this birth chart.",
        },
      ],
    });

    return Response.json({
      chart: chartData,
      reply: completion.choices[0]?.message?.content || "",
    });

  } catch (error: any) {
    console.error("ERROR:", error);
    return Response.json(
      { error: error?.toString() || "Server error" },
      { status: 500 }
    );
  }
}
