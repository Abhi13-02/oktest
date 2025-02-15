import { create } from "zustand";

export const useTestStore = create((set) => ({
  aiResponse: null,
  classroomID: null,
  testStartTime: null,
  description: "",
  teacherId: "",
  testType: "",
  duration: 0,
  testId: null,
  createdAt: new Date().toISOString(),
  questions: [],

  setAiResponse: (response) => set({ aiResponse: response }),
  setTestDetails: (details) => set((state) => ({ ...state, ...details })),
  setQuestions: (questions) => set({ questions }),
}));
