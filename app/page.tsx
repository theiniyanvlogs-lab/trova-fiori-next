"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  /* ✅ Convert Image to Base64 */
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-pink-50 px-6">
      <main className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl space-y-6 text-center">

        {/* Title */}
        <h1 className="text-4xl font-bold text-green-700 flex items-center justify-center gap-2">
          🌸 Trova Fiori
        </h1>

        <p className="text-gray-500">
          Upload a flower photo and identify instantly using AI 🌿
        </p>

        {/* ✅ Upload Button */}
        <label className="block w-full cursor-pointer">
          <span className="block w-full py-3 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">
            📤 Upload Flower Image
          </span>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* File Name */}
        {fileName && (
          <p className="text-sm text-gray-400">
            Selected: <span className="font-medium">{fileName}</span>
          </p>
        )}

        {/* Preview */}
        {image && (
          <img
            src={image}
            alt="Flower Preview"
            className="w-full rounded-2xl border shadow-sm mt-3"
          />
        )}

        {/* Identify Button */}
        <button
          onClick={identifyFlower}
          className="w-full py-3 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          {loading ? "🌼 Identifying..." : "📷 Identify Flower"}
        </button>

        {/* Loading Popup */}
        {loading && (
          <div className="bg-black/70 fixed inset-0 flex items-center justify-center">
            <div className="bg-white px-8 py-6 rounded-2xl shadow-lg text-center">
              <h2 className="text-xl font-bold text-green-700">
                Identifying Flower...
              </h2>
              <p className="text-gray-500 mt-2">Please wait 🌸</p>
            </div>
          </div>
        )}

        {/* Result Output */}
        {result && (
          <div className="bg-green-50 border border-green-200 p-5 rounded-2xl text-left whitespace-pre-line shadow-sm">
            <h2 className="font-bold text-green-700 mb-2">
              🌼 Identification Result
            </h2>
            <p className="text-gray-700">{result}</p>
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
