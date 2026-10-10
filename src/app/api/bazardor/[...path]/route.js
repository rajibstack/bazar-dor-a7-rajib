import { NextResponse } from "next/server";

const PRIMARY_URL = "https://api.api-store.workers.dev/api/bazardor";
const SECONDARY_URL = "https://api.abcz.workers.dev/api/bazardor";

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const pathArray = resolvedParams?.path || [];
  const subPath = pathArray.join("/");
  const { search } = new URL(request.url);

  let res;
  try {
    const primaryUrl = `${PRIMARY_URL}/${subPath}${search}`;
    res = await fetch(primaryUrl, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Primary API failed");
  } catch (error) {
    try {
      const secondaryUrl = `${SECONDARY_URL}/${subPath}${search}`;
      res = await fetch(secondaryUrl, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Secondary API failed");
    } catch (err) {
      return NextResponse.json({ error: "All APIs failed" }, { status: 500 });
    }
  }

  const data = await res.json();
  return NextResponse.json(data);
}