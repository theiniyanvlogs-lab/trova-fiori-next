import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

/* ✅ Cloudinary Config */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/* ✅ POST: Identify Flower */
export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    /* ✅ Upload Image to Cloudinary */
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "trova-fiori",
    });

    const imageUrl = uploadResult.secure_url;

    /* ✅ Call Grok Vision */
    const grokResponse = await fetch(
      "https://api.x.ai/v1/chat/completions",
      {
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
                {
                  type: "text",
                  text: `
You are a flower expert botanist.
Identify the flower in this image.
Return response in this format:

Flower Name:
Scientific Name:
Short Description:
`,
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await grokResponse.json();

    if (!data.choices) {
      return NextResponse.json(
        { error: "Grok API failed", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadedImage: imageUrl,
      flowerResult: data.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("Identify API Error:", err);

    return NextResponse.json(
      {
        error: "Flower identification failed",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
