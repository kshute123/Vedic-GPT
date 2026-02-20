export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY:", body);

    return Response.json({
      status: "route working",
      received: body
    });

  } catch (error: any) {
    console.error("ROUTE ERROR:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}