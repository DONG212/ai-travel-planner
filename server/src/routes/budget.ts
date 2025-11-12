import { Router } from "express";
import { z } from "zod";
import { estimateBudget } from "../services/llm";

const router = Router();

const BudgetInputSchema = z.object({
  destination: z.string().min(1),
  days: z.number().min(1),
  people: z.number().min(1),
  planSummary: z.string().default("")
});

router.post("/", async (req, res) => {
  const parse = BudgetInputSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.format() });
  }

  const apiKey = req.headers["x-llm-key"] as string | undefined;
  const mode = process.env.LLM_MODE || "MOCK";
  const provider = mode === "OPENAI" ? "OPENAI" : mode === "DASHSCOPE" ? "DASHSCOPE" : "MOCK";
  const key = apiKey || process.env.LLM_API_KEY || "";

  try {
    const budget = await estimateBudget(parse.data, { provider, apiKey: key });
    return res.json(budget);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to estimate budget" });
  }
});

export default router;