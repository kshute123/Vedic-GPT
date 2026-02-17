import { exec } from "child_process";
import path from "path";

export async function POST(req: Request) {
  const data = await req.json();

  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, "chart.py");

  return new Promise<Response>((resolve) => {
    exec(
      `python3 ${scriptPath} '${JSON.stringify(data)}'`,
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
}
