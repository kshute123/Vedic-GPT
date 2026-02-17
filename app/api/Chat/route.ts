import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

// IMPORTANT:
// Do NOT instantiate OpenAI at the top level.
// Railway builds the app and will crash if the key isn't present during build.

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const projectRoot = process.cwd();
    const pythonPath = path.join(projectRoot, "venv/bin/python");
    const scriptPath = path.join(projectRoot, "chart.py");

    return await new Promise<NextResponse>((resolve) => {
      exec(
        `${pythonPath} ${scriptPath} '${JSON.stringify(data)}'`,
        {
          env: {
            ...process.env,
            OPENAI_API_KEY: process.env.OPENAI_API_KEY, // ensure available to python if needed
          },
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error("Python error:", stderr);
            resolve(
              NextResponse.json(
                { error: stderr || "Python execution failed" },
                { status: 500 }
              )
            );
            return;
          }

          try {
            const parsed = JSON.parse(stdout);
            resolve(NextResponse.json(parsed));
          } catch {
            resolve(
              NextResponse.json(
                { error: "Invalid JSON returned from Python", raw: stdout },
                { status: 500 }
              )
            );
          }
        }
      );
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Invalid request" },
      { status: 400 }
    );
  }
}
