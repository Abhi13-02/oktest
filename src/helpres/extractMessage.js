
import { CohereClientV2 } from "cohere-ai";

// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

const cohere = new CohereClientV2({
  token: process.env.NEXT_PUBLIC_COHERE_AI_KEY,
});

export const generateBotReply = async (extractedText) => {
  
  const prompt = `
    You are an AI that extracts structured data from text.

    ### INPUT:
    I will provide a list of questions along with their answers. Your task is to convert them into a structured JSON format with:
    - A unique identifier for each question (handle nested questions like 1.a, 1.b).
    - The type of question (MCQ, Coding, Text).
    - The corresponding answers.
    - The marks for each question (if not explicitly mentioned, default to 1 mark).

    ### Example Input:
    1. (2 Marks) What is the capital of France?
       a) Berlin
       b) Madrid
       c) Paris
       d) Rome
       Answer: c

    2. (5 Marks) Write a function to check if a number is prime.
       Answer:
       \`\`\`python
       def is_prime(n):
           if n < 2:
               return False
           for i in range(2, int(n**0.5) + 1):
               if n % i == 0:
                   return False
           return True
       \`\`\`

    3. Explain the difference between HTTP and HTTPS.
       Answer: HTTP is not secure, while HTTPS uses encryption.
       (Default Marks: 1)

    ### Expected JSON Output:
    [
      {
        "id": "1",
        "question": "What is the capital of France?",
        "type": "MCQ",
        "options": ["Berlin", "Madrid", "Paris", "Rome"],
        "answer": "c",
        "marks": 2
      },
      {
        "id": "2",
        "question": "Write a function to check if a number is prime.",
        "type": "Coding",
        "answer": "def is_prime(n): ...",
        "marks": 5
      },
      {
        "id": "3",
        "question": "Explain the difference between HTTP and HTTPS.",
        "type": "Text",
        "answer": "HTTP is not secure, while HTTPS uses encryption.",
        "marks": 1
      }
    ]

    Now, process the following questions:
    ${extractedText}
`;


  try {
    const response = await cohere.chat({
      model: "command-r-plus",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the actual response text
    let botResponse = "";

    if (response && response.message && response.message.content) {
      botResponse = response.message.content[0].text;
    } else {
      return "No response received.";
    }

    console.log("Bot's Response:", botResponse);
  
    // console.log("Bot's Response:", botResponse); // Log the response text
    return botResponse;
  } catch (error) {
    console.error("Error in generateBotReply:", error);
    throw error;
  }
};
