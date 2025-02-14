"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateBotReply } from "@/helpres/extractMessage";


export default function PDFExtractor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("pdfFile", file);

    try {
      const response = await fetch("http://localhost:5000/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.text) {
        throw new Error("No text extracted");
      }

      // Process the extracted text
      // const dummy = "1) What is the capital of France? a) Berlin b) Madrid c) Paris d) Rome\n Answer: c \n\n 2) What is the difference between HTTP and HTTPS? \nAnswer: HTTP is not secure, while HTTPS uses encryption. \n\n"; 
      const aiResponse = await generateBotReply(data.text);

      // Navigate to the questions page with extracted JSON
      router.push(`/questions?data=${(aiResponse)}`);
      
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to process the PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold">Upload PDF</h1>

      <div className="mt-4">
        <input type="file" accept=".pdf" onChange={handleFileUpload} className="w-full p-2 border rounded" />
      </div>

      {loading && <p className="text-center my-4">Processing...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
