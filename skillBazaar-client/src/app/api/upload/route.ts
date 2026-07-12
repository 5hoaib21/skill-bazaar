import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Image upload not configured" }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const imgbbFormData = new FormData();
    imgbbFormData.append("image", base64);
    imgbbFormData.append("key", apiKey);

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData,
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json({ success: false, error: data.error?.message || "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: data.data.url,
      deleteUrl: data.data.delete_url,
      width: data.data.width,
      height: data.data.height,
    });
  } catch (err: any) {
    console.error("[Upload Error]", err);
    return NextResponse.json({ success: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}