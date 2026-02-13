import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // ✅ Remove base64 prefix
    const cleanBase64 = imageBase64.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    // ✅ Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      "data:image/jpeg;base64," + cleanBase64,
      { folder: "trova-fiori" }
    );

    const imageUrl = uploadResult.secure_url;

    console.log("Uploaded Image URL:", imageUrl);

    // ✅ Call Grok API (Correct Vision Model)
    const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-vision-1212",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Identify this flower name only." },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    const grokData = await grokRes.json();

    console.log("Grok Response:", grokData);

    // ❌ If Grok returns error
    if (!grokRes.ok) {
      return NextResponse.json(
        {
          error: "Grok API Error",
          details: grokData,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      flowerResult: grokData.choices[0].message.content,
      uploadedImage: imageUrl,
    });
  } catch (err: any) {
    console.error("FULL Identify Crash:", err);

    return NextResponse.json(
      {
        error: "Server crashed",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
