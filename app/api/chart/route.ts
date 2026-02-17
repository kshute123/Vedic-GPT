import { exec } from "child_process";
import path from "path";

async function geocodeLocation(location: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      location
    )}&format=json&limit=1`
  );

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Location not found");
  }

  return `${data[0].lat},${data[0].lon}`;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    let location = data.location;

    // If no comma, assume it's a city name
    if (!location.includes(",")) {
      location = await geocodeLocation(location);
    }

    const projectRoot = process.cwd();
    const scriptPath = path.join(projectRoot, "chart.py");

    const updatedData = {
      ...data,
      location,
    };

    return await new Promise<Response>((resolve) => {
      exec(
        `python3 ${scriptPath} '${JSON.stringify(updatedData)}'`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("Python error:", stderr);
            resolve(new Response(stderr, { status: 500 }));
            return;
          }

          resolve(
            new Response(stdout, {
              headers: { "Content-Type": "application/json" },
            })
          );
        }
      );
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
