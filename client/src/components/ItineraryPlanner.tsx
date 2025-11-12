import React, { useEffect, useRef, useState } from "react";
import { startListening, stopListening, SpeechSupport } from "../services/speech";
import { getLLMKey } from "../services/config";
import GuideView from "./GuideView";

export default function ItineraryPlanner() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(10000);
  const [people, setPeople] = useState(2);
  const [preferences, setPreferences] = useState("\u7f8e\u98df,\u52a8\u6f2b,\u4eb2\u5b50");
  const [listening, setListening] = useState(false);
  const [support, setSupport] = useState<SpeechSupport>("none");
  const [result, setResult] = useState<any>(null);
  const recRef = useRef<any>(null);
  const [routeDetails, setRouteDetails] = useState<{ km: number; mins: number; toll: number; cost: number } | null>(null);

  const LABELS = {
    destination: "\u76ee\u7684\u5730",
    days: "\u5929\u6570",
    budget: "\u9884\u7b97\uff08\u5143\uff09",
    people: "\u4eba\u6570",
    preferences: "\u504f\u597d\uff08\u7528\u9017\u53f7\u5206\u9694\uff09",
    generate: "\u751f\u6210\u884c\u7a0b",
    saveCloud: "\u4fdd\u5b58\u5230\u4e91\u7aef",
    speechStart: "\u8bed\u97f3\u8f93\u5165",
    speechStop: "\u505c\u6b62",
    resultTitle: "\u884c\u7a0b\u7ed3\u679c",
    saveOk: "\u5df2\u4fdd\u5b58\u5230\u4e91\u7aef",
    saveFail: "\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u767b\u5f55\u4e0e Supabase \u914d\u7f6e",
    /* 新增以下三项，避免直写中文造成乱码 */
    waitMsg: "\u6b63\u5728\u751f\u6210\u884c\u7a0b\uff0c\u8bf7\u7a0d\u5019\u2026",
    emptyPlanTip: "\u5c1a\u672a\u751f\u6210\u884c\u7a0b",
    generatingText: "\u751f\u6210\u4e2d\u2026"
  };

  useEffect(() => {
    const sup = startListening({
      onStart: (rec) => { recRef.current = rec; setSupport("web"); },
      onResult: (txt) => setDestination(txt),
      autoStart: false
    });
    setSupport(sup.support);
    return () => stopListening(recRef.current);
  }, []);

  const onMic = () => {
    if (listening) {
      stopListening(recRef.current);
      setListening(false);
    } else {
      startListening({
        onStart: (rec) => { recRef.current = rec; setListening(true); },
        onResult: (txt) => { setDestination(txt); setListening(false); }
      });
    }
  };

  const renderPlanOnMap = async (plan: any) => {
    const AMap = (window as any).AMap;
    const map = (window as any).__AI_TRAVEL_MAP__;
    if (!AMap || !map || !plan?.days?.length) return;

    const day = plan.days[0];
    const cityHint = (plan?.summary || "").match(/[\u4e00-\u9fa5A-Za-z]+/)?.[0] || "";

    const geocodeKey = (hint: string, name: string) => `${hint}:${name}`;
    const readCache = (key: string) => {
        try {
            const raw = localStorage.getItem("geocode_cache") || "{}";
            const obj = JSON.parse(raw);
            const v = obj[key];
            if (v && typeof v.lng === "number" && typeof v.lat === "number") {
                return new AMap.LngLat(v.lng, v.lat);
            }
        } catch {}
        return null;
    };
    const writeCache = (key: string, loc: any) => {
        try {
            const raw = localStorage.getItem("geocode_cache") || "{}";
            const obj = JSON.parse(raw);
            obj[key] = { lng: loc.lng, lat: loc.lat };
            localStorage.setItem("geocode_cache", JSON.stringify(obj));
        } catch {}
    };

    const geocodeIfNeeded = async (act: any) => {
        if (typeof act?.lat === "number" && typeof act?.lng === "number") {
            return new AMap.LngLat(act.lng, act.lat);
        }
        const key = geocodeKey(cityHint, act.name);
        const cached = readCache(key);
        if (cached) return cached;

        const geocoder = new AMap.Geocoder();
        return await new Promise<any>((res) => {
            geocoder.getLocation(`${cityHint} ${act.name}`, (status: string, result: any) => {
                if (status === "complete" && result?.geocodes?.[0]?.location) {
                    const loc = result.geocodes[0].location;
                    writeCache(key, loc);
                    res(loc);
                } else res(null);
            });
        });
    };

    const pts: any[] = [];
    for (const act of day.activities || []) {
        const loc = await geocodeIfNeeded(act);
        if (!loc) continue;
        const marker = new AMap.Marker({ position: loc, title: act.name });
        map.add(marker);
        const info = new AMap.InfoWindow({ content: `<div style="padding:4px 8px"><b>${act.name}</b><br>${act.address || ""}</div>` });
        marker.on("click", () => info.open(map, loc));
        pts.push(loc);
    }

    const formatRoute = (route: any) => {
        const km = (route?.distance || 0) / 1000;
        const mins = Math.round((route?.time || 0) / 60);
        const toll = route?.tolls || 0;
        // 简易费用估算：按油耗 8L/100km，油价 8 元/L => ~0.64 元/公里，四舍五入
        const costFuel = Math.round(km * 0.64);
        return { km: Number(km.toFixed(1)), mins, toll, cost: costFuel };
    };

    if (pts.length >= 2) {
        AMap.plugin(["AMap.Driving"], () => {
            const driving = new AMap.Driving({ map, policy: AMap.DrivingPolicy.LEAST_TIME });
            const start = pts[0], end = pts[pts.length - 1], waypoints = pts.slice(1, -1);
            driving.search(start, end, { waypoints });
            driving.on("complete", (res: any) => {
                const r = res?.routes?.[0];
                if (r) setRouteDetails(formatRoute(r));
            });
        });
    }
    if (pts.length) map.setFitView();
};

  /* 图片候选源：按顺序尝试 */
  const imageUrls = (query: string) => [
      `https://source.unsplash.com/featured/?${encodeURIComponent(query)}`,
      `https://loremflickr.com/800/600/${encodeURIComponent(query)}`,
      `https://picsum.photos/seed/${encodeURIComponent(query)}/800/600`
  ];
  /* 默认首选源（保持原函数名以最小改动） */
  const activityImage = (name: string) => imageUrls(name)[0];

  /* 并发防护：生成中状态 + 同步锁 + 请求ID + AbortController */
  const [generating, setGenerating] = useState(false);
  const genLockRef = useRef(false);
  const reqIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const onPlan = async () => {
    if (!destination.trim()) {
      alert("请先填写目的地");
      return;
    }
    if (genLockRef.current) return; // 阻止同一时刻重入
    genLockRef.current = true;
    setGenerating(true);

    // 请求竞态保护：递增请求ID，取消旧请求
    reqIdRef.current += 1;
    const myReqId = reqIdRef.current;
    try { abortRef.current?.abort(); } catch {}
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const llmKey = getLLMKey();
      const resp = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(llmKey ? { "x-llm-key": llmKey } : {}) },
        body: JSON.stringify({
          destination, days, budget, people,
          preferences: preferences.split(",").map(s => s.trim()).filter(Boolean)
        }),
        signal: ac.signal as any
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        if (myReqId === reqIdRef.current) {
          setResult({ error: `HTTP ${resp.status}`, details: text || "请检查后端运行状态和输入合法性" });
        }
        return;
      }
      const json = await resp.json();
      if (myReqId === reqIdRef.current) {
        setResult(json);
        try { localStorage.setItem("latest_plan", JSON.stringify(json)); } catch {}
        renderPlanOnMap(json);
      }
    } catch (e: any) {
      if (myReqId === reqIdRef.current) {
        setResult({ error: "连接失败", details: e?.message || String(e) });
      }
    } finally {
      if (myReqId === reqIdRef.current) {
        setGenerating(false);
        genLockRef.current = false;
      }
    }
  };

  const onSave = async () => {
    if (!result) return;
    const payload = {
      destination,
      days,
      budget,
      people,
      preferences: preferences.split(",").map(s => s.trim()).filter(Boolean),
      plan: result
    };
    const { savePlan } = await import("../services/supabase");
    const ok = await savePlan(payload);
    alert(ok ? LABELS.saveOk : LABELS.saveFail);
  };

  return (
    <div>
      {/* 生成中遮罩，防止误操作 */}
      {generating ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ padding: 16, borderRadius: 12, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: 16, fontWeight: 600 }}>
            {LABELS.waitMsg}
          </div>
        </div>
      ) : null}

      {/* 表单区域 */}
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label>{LABELS.destination}</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ flex: 1 }} value={destination} onChange={e => setDestination(e.target.value)} />
            <button onClick={onMic} disabled={support === "none"}>{listening ? LABELS.speechStop : LABELS.speechStart}</button>
          </div>
        </div>
        <div>
          <label>{LABELS.days}</label>
          <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} />
        </div>
        <div>
          <label>{LABELS.budget}</label>
          <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
        </div>
        <div>
          <label>{LABELS.people}</label>
          <input type="number" value={people} onChange={e => setPeople(Number(e.target.value))} />
        </div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label>{LABELS.preferences}</label>
          <input style={{ width: "100%" }} value={preferences} onChange={e => setPreferences(e.target.value)} />
        </div>
      </div>

      {/* 操作按钮（生成中禁用，避免重复触发） */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={onPlan}
          disabled={generating}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: generating ? "#e5e7eb" : "#111827",
            color: generating ? "#6b7280" : "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            cursor: generating ? "not-allowed" : "pointer"
          }}
        >
          {generating ? LABELS.generatingText : LABELS.generate}
        </button>
        <button
          style={{ marginLeft: 8, padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
          onClick={onSave}
          disabled={!result || generating}
        >
          {LABELS.saveCloud}
        </button>
      </div>

      {/* 结果区域：人类可读攻略视图 */}
      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>{LABELS.resultTitle}</h3>
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {result ? <GuideView plan={result} /> : <div style={{ color: "#666" }}>{LABELS.emptyPlanTip}</div>}
        </div>
        {result?.days?.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
                {result.days[0].activities.map((act: any, idx: number) => {
                    const name = typeof act === "string"
                        ? String(act).replace(/^[^\uff1a:]*[\uff1a:]/, "")
                        : (act?.name || "");
                    const query = `${destination} ${name}`;
                    return (
                        <div key={idx} style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", background: "#fff" }}>
                            <img
                                src={activityImage(query)}
                                alt={name}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                data-try="0"
                                onError={(e) => {
                                    const el = e.currentTarget;
                                    const urls = imageUrls(query);
                                    const next = Number(el.getAttribute("data-try") || "0") + 1;
                                    if (next < urls.length) {
                                        el.setAttribute("data-try", String(next));
                                        el.src = urls[next];
                                    } else {
                                        el.src = `https://placehold.co/800x600?text=${encodeURIComponent(name)}`;
                                    }
                                }}
                                style={{ width: "100%", height: 160, objectFit: "cover" }}
                            />
                            <div style={{ padding: 10 }}>
                                <div style={{ fontWeight: 600 }}>{name}</div>
                                <div style={{ fontSize: 12, color: "#666" }}>{destination}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : null}
      </div>
    </div>
  );
}

/* 删除文件底部的本地 GuideView 定义（已改为独立组件） */