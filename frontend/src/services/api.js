// Shared API helpers for calling the FastAPI backend from the React frontend.
import { chatApi } from "./apiService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function askAI(prompt) {
  const response = await fetch(
    `${API_BASE_URL}/chat?prompt=${encodeURIComponent(prompt)}`
  );

  if (!response.ok) {
    throw new Error("Unable to reach the AI service right now.");
  }

  const data = await response.json();
  return data.response;
}

export async function sendChatMessage(prompt) {
  const response = await chatApi.sendMessage(prompt);
  return response.data.response;
}
