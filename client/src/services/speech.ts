export type SpeechSupport = "web" | "none";

type Opts = {
  onStart?: (rec: any) => void;
  onResult?: (text: string) => void;
  autoStart?: boolean;
};

export function startListening(opts: Opts) {
  const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SR) {
    return { support: "none" as SpeechSupport };
  }
  const rec = new SR();
  rec.lang = "zh-CN";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onstart = () => opts.onStart?.(rec);
  rec.onresult = (e: any) => {
    const text = e.results?.[0]?.[0]?.transcript || "";
    opts.onResult?.(text);
  };
  rec.onerror = () => {};
  if (opts.autoStart !== false) rec.start();
  return { support: "web" as SpeechSupport };
}

export function stopListening(rec: any) {
  try { rec?.stop?.(); } catch {}
}