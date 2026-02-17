import { spawn } from "child_process";
import path from "path";

export async function POST(req: Request) {
  const data = await req.json();

  const scriptPath = path.resolve("./chart.py");

  return new Promise<Response>((resolve) => {
    const python = spawn("python3", [scriptPath, JSON.stringify(data)]);

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
        console.error("Python error:", stderr);
        resolve(new Response(stderr || "Python failed", { status: 500 }));
        return;
      }

      resolve(
        new Response(stdout, {
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });
}
