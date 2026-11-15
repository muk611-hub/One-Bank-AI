import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
let fastTtsClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function getFastTtsClient(): GoogleGenAI | null {
  if (!fastTtsClient && process.env.GEMINI_API_KEY) {
    fastTtsClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
        retryOptions: {
          attempts: 1,
        },
      },
    });
  }
  return fastTtsClient;
}

const ttsModelCooldownUntil: Record<string, number> = {};
const TTS_MODELS = ["gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts"] as const;
const hindiAdaptationCache = new Map<string, string>();

function isRateLimitError(err: any): boolean {
  const msg = String(err?.message || "");
  return err?.status === 429 || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "ONE AI Banking", timestamp: new Date().toISOString() });
  });

  // Helper to adapt English text to conversational Hindi if needed and pick style
  async function prepareTtsInput(
    ai: GoogleGenAI,
    rawText: string,
    language: unknown
  ): Promise<{ spokenText: string; voiceStyle: string; lang: "en" | "hi" }> {
    const lang: "en" | "hi" = language === "hi" ? "hi" : "en";
    let spokenText = rawText.trim().slice(0, 2500);

    if (lang === "hi" && !/[\u0900-\u097F]/.test(spokenText)) {
      const cachedHi = hindiAdaptationCache.get(spokenText);
      if (cachedHi) {
        spokenText = cachedHi;
      } else {
        try {
          const translationPromise = ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `Convert this banking assistant reply into short, natural spoken Hindi (Devanagari script) as spoken by a friendly young Indian woman (use feminine grammar like "कर सकती हूँ", "बताइए"). Keep EMI, CIBIL, OTP, IFSC, Airtel, HDFC natural, write rupee amounts in Hindi words, and output ONLY the Hindi text.\n\n"${spokenText}"`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            },
          });
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 3500)
          );
          const translationResponse = await Promise.race([
            translationPromise,
            timeoutPromise,
          ]);
          const translated = translationResponse?.text?.trim();
          if (translated) {
            if (hindiAdaptationCache.size >= 100) {
              const firstKey = hindiAdaptationCache.keys().next().value;
              if (firstKey) hindiAdaptationCache.delete(firstKey);
            }
            hindiAdaptationCache.set(spokenText, translated);
            spokenText = translated;
          }
        } catch (transErr: any) {
          console.warn("Hindi adaptation fallback:", transErr?.message || transErr);
        }
      }
    }

    const voiceStyle =
      lang === "hi"
        ? "Warm, lively, friendly young Indian woman speaking natural everyday Hindi at a crisp, brisk conversational pace—clear, expressive, authentic Indian female voice, never slow or robotic"
        : "Warm, lively, friendly young Indian woman speaking Indian English with a natural Indian accent at a crisp, brisk conversational pace—clear, expressive, human-like banking concierge, never slow or robotic";

    return { spokenText, voiceStyle, lang };
  }

  // Streaming Realistic Indian Girl Voice TTS (raw 24kHz L16 PCM chunks)
  app.post("/api/tts/stream", async (req, res) => {
    try {
      const { text, language = "en" } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Text is required" });
      }

      const ai = getFastTtsClient();
      if (!ai) {
        return res.status(503).json({ error: "Gemini API key not configured" });
      }

      const { spokenText, voiceStyle, lang } = await prepareTtsInput(ai, text, language);
      const now = Date.now();
      const availableModels = TTS_MODELS.filter(
        (m) => !ttsModelCooldownUntil[m] || ttsModelCooldownUntil[m] <= now
      );

      if (availableModels.length === 0) {
        return res.status(429).json({
          hasAudio: false,
          rateLimited: true,
          spokenText,
          language: lang,
          error: "TTS quota cooldown active",
        });
      }

      let responseStream: AsyncIterable<any> | null = null;
      let lastError: any = null;

      for (const model of availableModels) {
        try {
          responseStream = await ai.models.generateContentStream({
            model,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: spokenText,
                    speechMetadata: {
                      style: voiceStyle,
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Zephyr" },
                },
              },
            },
          });
          break;
        } catch (err: any) {
          lastError = err;
          if (isRateLimitError(err)) {
            ttsModelCooldownUntil[model] = Date.now() + 5 * 60_000;
            continue;
          }
          throw err;
        }
      }

      if (!responseStream) {
        return res.status(429).json({
          hasAudio: false,
          rateLimited: true,
          spokenText,
          language: lang,
          error: lastError?.message || "TTS rate limited",
        });
      }

      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Accel-Buffering", "no");

      let clientClosed = false;
      res.on("close", () => {
        clientClosed = true;
      });

      for await (const chunk of responseStream) {
        if (clientClosed || res.writableEnded) break;
        const parts = chunk.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          const data = part?.inlineData?.data;
          if (data) {
            const pcmBuf = Buffer.from(data, "base64");
            res.write(pcmBuf);
          }
        }
      }

      if (!res.writableEnded) {
        res.end();
      }
    } catch (error: any) {
      console.error("Gemini TTS stream error:", error?.message || error);
      if (!res.headersSent) {
        const status = isRateLimitError(error) ? 429 : 500;
        return res.status(status).json({ error: error?.message || "TTS stream unavailable" });
      }
      if (!res.writableEnded) {
        res.end();
      }
    }
  });

  // Unary TTS endpoint (for prefetch / WAV fallback)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, language = "en" } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ hasAudio: false, error: "Text is required" });
      }

      const ai = getFastTtsClient();
      if (!ai) {
        return res.json({ hasAudio: false, error: "Gemini API key not configured" });
      }

      const { spokenText, voiceStyle, lang } = await prepareTtsInput(ai, text, language);
      const now = Date.now();
      const availableModels = TTS_MODELS.filter(
        (m) => !ttsModelCooldownUntil[m] || ttsModelCooldownUntil[m] <= now
      );

      for (const model of availableModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: spokenText,
                    speechMetadata: {
                      style: voiceStyle,
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Zephyr" },
                },
              },
            },
          });

          const base64Audio =
            response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

          if (base64Audio) {
            return res.json({
              hasAudio: true,
              audioBase64: base64Audio,
              mimeType: "audio/wav",
              language: lang,
              spokenText,
            });
          }
        } catch (err: any) {
          if (isRateLimitError(err)) {
            ttsModelCooldownUntil[model] = Date.now() + 5 * 60_000;
            continue;
          }
          throw err;
        }
      }

      return res.status(429).json({
        hasAudio: false,
        rateLimited: true,
        spokenText,
        language: lang,
        error: "TTS quota exhausted",
      });
    } catch (error: any) {
      console.error("Gemini TTS error:", error?.message || error);
      return res.json({
        hasAudio: false,
        error: error?.message || "TTS unavailable",
      });
    }
  });

  // AI Intent & Response Assistant (Server-side Gemini fallback for free-form conversational queries)
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message } = req.body;
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
        model: "gemini-4-hydrogen",
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
