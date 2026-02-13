"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  /* ✅ Convert Image to Base64 */
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* ✅ Identify Flower */
  const identifyFlower = async () => {
    if (!image) {
      alert("Please upload a flower image!");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: image,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setResult("❌ Error: " + data.error);
      } else {
        setResult(data.flowerResult);
      }
    } catch (err) {
      setResult("❌ Flower identification failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <main className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl space-y-6 text-center">

        {/* Title */}
        <h1 className="text-4xl font-bold text-green-700">
          🌸 Trova Fiori
        </h1>

        <p className="text-gray-500">
          Upload a flower photo and identify instantly using AI.
        </p>

        {/* Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />

        {/* Preview */}
        {image && (
          <img
            src={image}
            alt="Flower Preview"
            className="w-full rounded-xl border mt-3"
          />
        )}

        {/* Button */}
        <button
          onClick={identifyFlower}
          className="w-full py-3 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          {loading ? "🌼 Identifying..." : "📷 Identify Flower"}
        </button>

        {/* Result */}
        {result && (
          <div className="bg-green-100 p-4 rounded-xl text-left whitespace-pre-line">
            {result}
          </div>
        )}

        {/* Footer */}
        <p className="text-sm text-gray-400 pt-4">
          Powered by Cloudinary + Grok Vision 🌱
        </p>
      </main>
    </div>
  );
}
