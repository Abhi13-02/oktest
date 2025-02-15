"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateBotReply } from "../../helpres/extractMessage";
import { useTestStore } from "../../zustand/store";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function PDFExtractor({ classroomID }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testStartTime, setTestStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const router = useRouter();
  const { setAiResponse, setTestDetails, aiResponse } = useTestStore();

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
      if (!data.text) throw new Error("No text extracted");

      const aiGeneratedText = await generateBotReply(data.text);
      setAiResponse(aiGeneratedText);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to process the PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = () => {
    if (!testStartTime || !duration) {
      alert("Please enter test start time and duration");
      return;
    }

    const testDetails = {
      classroomID,
      testStartTime,
      duration: parseInt(duration, 10),
      description: "Generated Test",
      teacherId: "T123",
      testType: "MCQ",
      createdAt: new Date().toISOString(),
    };

    setTestDetails(testDetails);

    const testsRef = collection(db, "classrooms", classroomID, "tests");
    addDoc(testsRef, testDetails)
      .then((docRef) => {
        console.log("Test created with ID:", docRef.id);
        const updatedDetails = { ...testDetails, testId: docRef.id };
        setTestDetails(updatedDetails);
      })
      .catch((error) => {
        console.error("Error creating test:", error);
      });


    router.push("/questions");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold">Upload PDF</h1>

      <div className="mt-4">
        <input type="file" accept=".pdf" onChange={handleFileUpload} className="w-full p-2 border rounded" />
      </div>

      {loading && <p className="text-center my-4">Processing...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {aiResponse && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h2 className="font-semibold">AI Response:</h2>
          <pre className="text-sm text-gray-700">{aiResponse}</pre>

          <div className="mt-4">
            <label className="block font-semibold">Test Start Time:</label>
            <input
              type="datetime-local"
              value={testStartTime}
              onChange={(e) => setTestStartTime(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mt-4">
            <label className="block font-semibold">Duration (minutes):</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleCreateTest}
          >
            Create Test
          </button>
        </div>
      )}
    </div>
  );
}
