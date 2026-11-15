import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "ONE AI Banking", timestamp: new Date().toISOString() });
  });

  // AI Intent & Response Assistant (Server-side Gemini fallback for free-form conversational queries)
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, customerProfile, conversationHistory } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          hasGemini: false,
          reply: null,
          intent: null,
        });
      }

      const systemPrompt = `You are the AI Banking Relationship Manager for "ONE — AI Banking", an AI-native digital bank.
The customer is Mukesh Bansal (Relationship: 12+ years, Savings: ₹2,48,500, Bureau Score: 782, Existing Home Loan with Other Bank: ₹42 Lakhs @ 8.75% EMI ₹46,500, Existing Vehicle Loan nearing maturity).
Key philosophy: "Customer Intent First. Product Selection Second. Don't navigate the bank, just talk to it."
Tone: Professional, warm, concise, confident, banking-aware. Never output walls of text. Provide helpful, conversational responses framed around the customer's intent, eligibility, or direct simulated action.
Always return responses in a banking-aware concise style (2-3 sentences max) with actionable next steps.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nCustomer message: "${message}"` }] }
        ],
      });

      const text = response.text || "";
      return res.json({
        hasGemini: true,
        reply: text,
      });
    } catch (error: any) {
      console.error("Gemini API error:", error?.message || error);
      return res.json({
        hasGemini: false,
        error: error?.message || "AI unavailable",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ONE AI Banking server running on http://localhost:${PORT}`);
  });
}

startServer();
