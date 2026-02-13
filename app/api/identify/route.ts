import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // ✅ Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "flowers",
    });

    const imageUrl = uploadResult.secure_url;

    // ✅ Call Grok Vision API
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-vision-beta",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Identify this flower." },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      uploadedImage: imageUrl,
      result: data.choices?.[0]?.message?.content || "No result",
    });
  } catch (err: any) {
    console.error("API Crash:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
