// app/api/test-upload/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ 
    status: "Test upload route working", 
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  return Response.json({ 
    status: "POST method working", 
    timestamp: new Date().toISOString(),
    method: req.method
  });
}
