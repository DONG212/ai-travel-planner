import { Router } from "express";
import { z } from "zod";
import { generateItinerary } from "../services/llm.js";

const router = Router();

const PlanInputSchema = z.object({
  destination: z.string().min(1),
  days: z.number().min(1),
  budget: z.number().min(0),
  people: z.number().min(1),
  preferences: z.array(z.string()).default([])
});

router.post("/", async (req, res) => {
  const parse = PlanInputSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.format() });
  }

  const apiKey = req.headers["x-llm-key"] as string | undefined;
  const hdrMode = (req.headers["x-llm-mode"] as string | undefined)?.toUpperCase();
  const mode = hdrMode || process.env.LLM_MODE || "MOCK";
  const provider = mode === "OPENAI" ? "OPENAI" : mode === "DASHSCOPE" ? "DASHSCOPE" : "MOCK";
  const key = apiKey || process.env.LLM_API_KEY || "";

  console.log("[/api/plan] mode=%s provider=%s apiKeyPresent=%s (hdrOverride=%s)", mode, provider, !!key, !!hdrMode);

  try {
    const plan = await generateItinerary(parse.data, { provider, apiKey: key });
    return res.json({ ...plan, meta: { provider, mode } });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to generate itinerary", meta: { provider, mode } });
  }
});

export default router;