"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function identifyFlower() {
    if (!image) return alert("Please upload a flower image!");

    setLoading(true);
    setResult("");

    // Temporary demo result
    setTimeout(() => {
      setResult("🌸 Flower Identified: Rose");
      setLoading(false);
    }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <main className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">

        <h1 className="text-3xl font-bold text-green-700">
          🌸 Trova Fiori
        </h1>

        <p className="text-gray-500">
          Upload a flower image and identify it instantly.
        </p>

        {/* Upload */}
        <input
          type="file"
          accept="image/*"
          className="w-full"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        {/* Button */}
        <button
          onClick={identifyFlower}
          className="w-full py-3 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          {loading ? "Identifying..." : "Identify Flower"}
        </button>

        {/* Result */}
        {result && (
          <div className="p-4 bg-green-100 rounded-xl text-green-800 font-medium">
            {result}
          </div>
        )}
      </main>
    </div>
  );
}
