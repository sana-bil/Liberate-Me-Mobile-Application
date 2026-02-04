import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace 'YOUR_API_KEY' with the key you got from Google AI Studio
const API_KEY = "AIzaSyAcrE4XYfBw94ncQzAzUiwSV5YEj9_rHYw"; 
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  // UPDATE THIS LINE
  model: "gemini-3-flash-preview", 
  systemInstruction: "You are Echo...", // Keep your existing instructions
});

export const getEchoResponse = async (userMessage: string, history: { role: string, parts: { text: string }[] }[]) => {
  try {
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little trouble connecting right now, but I'm still here for you. ❤";
  }
};