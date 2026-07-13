import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
    if (!apiKey) return NextResponse.json({ error: "Upload service not configured" }, { status: 500 });

    const uploadForm = new FormData();
    uploadForm.append("image", base64);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: uploadForm,
    });

    const data = await res.json();
    if (!data.success) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

    return NextResponse.json({ url: data.data.url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
