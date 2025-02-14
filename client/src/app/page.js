"use client";

"use client";

import { generateBotReply } from "@/helpres/extractMessage";
import { useState } from "react";

export default function PDFExtractor() {
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("pdfFile", file);

    try {
      const response = await fetch("http://localhost:5000/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setExtractedText(data.text);
      const aiResponse = "1. (2 Marks) What is the capital of France?\n   a) Berlin\n   b) Madrid\n   c) Paris\n   d) Rome\n   Answer: c\n\n2. (3 Marks) Which data structure uses LIFO (Last In, First Out)?\n   a) Queue\n   b) Stack\n   c) Linked List\n   d) Array\n   Answer: b\n\n3. (5 Marks) Solve the following problem:\n   Write a function to check if a number is prime.\n   Answer:\n   def is_prime(n):\n       if n < 2:\n           return False\n       for i in range(2, int(n**0.5) + 1):\n           if n % i == 0:\n               return False\n       return True\n\n4. Explain the difference between HTTP and HTTPS.\n   Answer: HTTP is not secure, while HTTPS uses encryption.\n\n5. (4 Marks) Identify the correct statements:\n   a) The Earth is flat.\n   b) Water boils at 100°C at sea level.\n   c) The moon emits its own light.\n   Answer: b\n\n6. (6 Marks) Consider the following nested question:\n   6.a) What is the output of `print(2 ** 3)` in Python?\n        Answer: 8\n   6.b) Explain why the output is 8.\n        Answer: `2 ** 3` means 2 raised to the power of 3, which equals 8.\n"
      const resp = await generateBotReply(aiResponse);
      console.log(resp.length);
      
    } catch (error) {
      console.error("Error extracting text:", error);
      alert("Failed to extract text from PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold">PDF Text Extractor</h1>

      <div className="mt-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Upload PDF
        </label>
        <input type="file" accept=".pdf" onChange={handleFileUpload} className="w-full p-2 border rounded" />
      </div>

      {loading && (
        <div className="text-center my-4">
          <p>Extracting text...</p>
        </div>
      )}

      {extractedText && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Extracted Text:</h3>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <pre className="whitespace-pre-wrap">{extractedText}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
