export async function POST(req: Request) {
  return new Response(
    JSON.stringify({ test: "API is working" }),
    { headers: { "Content-Type": "application/json" } }
  );
}