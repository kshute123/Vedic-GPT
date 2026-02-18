import OpenAI from "openai";
// @ts-ignore
import tzlookup from "tz-lookup";
import { spawn } from "child_process";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Convert city name → lat/lon
 */
async function geocodeCity(city: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      city
    )}`,
    {
      headers: {
        "User-Agent": "vedic-gpt-app",
      },
    }
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
    const { city, date, time } = body;

    if (!city || !date || !time) {
      return Response.json(
        { error: "Missing city, date, or time" },
        { status: 400 }
      );
    }

    // 1️⃣ Geocode
    const { lat, lon } = await geocodeCity(city);

    // 2️⃣ Timezone
    const timezone = tzlookup(lat, lon);

    // 3️⃣ Call Python
    const pythonPayload = JSON.stringify({
      date,
      time,
      location: `${lat},${lon}`,
      timezone,
    });

    const chartData: any = await new Promise((resolve, reject) => {
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
          reject(
            new Error(
              `Python failed with code ${code}\nSTDERR:\n${stderr}\nSTDOUT:\n${stdout}`
            )
          );
        } else {
          try {
            resolve(JSON.parse(stdout));
          } catch (err) {
            reject(new Error("Failed to parse Python output:\n" + stdout));
          }
        }
      });
    });

    // 4️⃣ OpenAI
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
Interpret charts strictly using Jyotish principles.

Provide:
- Ascendant analysis
- Sun & Moon meaning
- Personality themes
- Strengths & weaknesses
- Career indications
- Relationship patterns
- Spiritual themes

Chart data:
${JSON.stringify(chartData)}
          `,
        },
        {
          role: "user",
          content:
            "Provide a full Vedic astrology interpretation of this birth chart.",
        },
      ],
    });

    return Response.json({
      chart: chartData,
      interpretation:
        completion.choices[0]?.message?.content || "No interpretation generated.",
    });

  } catch (error: any) {
    console.error("FULL ERROR:", error);

    return Response.json(
      {
        error:
          error?.stack ||
          error?.message ||
          error?.toString() ||
          "Server error",
      },
      { status: 500 }
    );
  }
}
