"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const data = searchParams.get("data");
    console.log("Received data:", data);

    const extractJSON = (responseString) => {
      try {
        if (!responseString) return null;

        // Extract JSON from Markdown-style code block
        const match = responseString.match(/```json\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          return JSON.parse(match[1]);
        }
      } catch (error) {
        console.error("Failed to parse JSON:", error);
      }
      return null;
    };

    if (data) {
      const parsedJSON = extractJSON(data);
      console.log("Extracted JSON:", parsedJSON);

      if (parsedJSON) setQuestions(parsedJSON);
    }
  }, [searchParams]);

  const handleSaveToDatabase = async () => {
    try {
      for (const question of questions) {
        await addDoc(collection(db, "questions"), {
          id: question.id,
          question: question.question,
          type: question.type,
          options: question.options || null,
          correctAnswer: question.answer, // ✅ Storing the correct answer
          marks: question.marks || 1,
        });
      }
      alert("Questions saved successfully!");
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold">Preview Questions</h1>

      {questions.length === 0 ? (
        <p>No questions found</p>
      ) : (
        <div className="space-y-6 mt-4">
          {questions.map((q, index) => (
            <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
              <p className="font-bold">
                {index + 1}. {q.question} ({q.marks || 1} Marks)
              </p>

              {q.type === "MCQ" && (
                <ul className="mt-2">
                  {q.options.map((option, i) => (
                    <li key={i}>{option}</li>
                  ))}
                </ul>
              )}

              {q.type === "Text" && (
                <p className="mt-2 italic">Text-based answer required</p>
              )}

              {q.type === "Coding" && (
                <p className="mt-2 italic">Coding response required</p>
              )}

              {/* ✅ Show correct answer for preview */}
              <p className="mt-2 text-green-600">
                <strong>Correct Answer:</strong> {q.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {questions.length > 0 && (
        <button
          onClick={handleSaveToDatabase}
          className="mt-6 w-full p-3 bg-blue-500 text-white rounded-lg"
        >
          Save to Database
        </button>
      )}
    </div>
  );
}
