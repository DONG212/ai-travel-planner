import React, { useEffect, useMemo, useState } from "react";

export default function MultiDayMap() {
  const [plan, setPlan] = useState<any>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [routeDetails, setRouteDetails] = useState<{ km: number; mins: number; toll: number; cost: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("latest_plan");
      if (raw) setPlan(JSON.parse(raw));
    } catch {}
  }, []);

  const days = useMemo(() => (plan?.days || []), [plan]);

  useEffect(() => {
    const AMap = (window as any).AMap;
    const map = (window as any).__AI_TRAVEL_MAP__;
    if (!AMap || !map || !days.length) return;

    try { map.clearMap(); } catch {}
    setRouteDetails(null);

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

    const geocodeIfNeeded = async (AMap: any, map: any, act: any, cityHint: string) => {
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

    const render = async () => {
      const d = days[Math.max(0, Math.min(dayIndex, days.length - 1))];
      const cityHint = (plan?.summary || "").match(/[\u4e00-\u9fa5A-Za-z]+/)?.[0] || "";
      const pts: any[] = [];

      for (const act of d.activities || []) {
        const loc = await geocodeIfNeeded(AMap, map, act, cityHint);
        if (!loc) continue;
        const marker = new AMap.Marker({ position: loc, title: act.name });
        map.add(marker);
        const content = `<div style="padding:4px 8px"><b>${act.name}</b><br>${act.address || ""}</div>`;
        const info = new AMap.InfoWindow({ content });
        marker.on("click", () => info.open(map, loc));
        pts.push(loc);
      }

      const formatRoute = (route: any) => {
        const km = (route?.distance || 0) / 1000;
        const mins = Math.round((route?.time || 0) / 60);
        const toll = route?.tolls || 0;
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

    render();
  }, [dayIndex, days, plan]);

  if (!days.length) return <div>{"\u6682\u65e0\u884c\u7a0b\u6570\u636e\uff0c\u8bf7\u5728\u201c\u884c\u7a0b\u89c4\u5212\u201d\u9875\u751f\u6210\u884c\u7a0b\u3002"}</div>;

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <label>{"\u9009\u62e9\u5929\u6570\uff1a"}</label>
        <select value={dayIndex} onChange={e => setDayIndex(Number(e.target.value))}>
          {days.map((d: any, i: number) => <option key={i} value={i}>{`\u7b2c ${d.day} \u5929`}</option>)}
        </select>
      </div>
      {routeDetails ? (
        <div style={{ border: "1px solid #eee", padding: 10, borderRadius: 8, background: "#fafafa", marginBottom: 8 }}>
          <div style={{ fontWeight: 600 }}>{"\u8def\u7ebf\u8be6\u60c5"}</div>
          <div style={{ fontSize: 13, color: "#333", marginTop: 4 }}>
            {`\u9884\u8ba1\u7528\u65f6\uff1a${routeDetails.mins} \u5206\u949f \u00b7 \u8ddd\u79bb\uff1a${routeDetails.km} \u516c\u91cc \u00b7 \u9884\u8ba1\u8d39\u7528\uff1a${routeDetails.cost} \u5143`}{routeDetails.toll ? ` \u00b7 \u9ad8\u901f\u8d39\uff1a${routeDetails.toll} \u5143` : ""}
          </div>
        </div>
      ) : null}
      <div>{"\u5df2\u6839\u636e\u9009\u4e2d\u5929\u6570\u5728\u5730\u56fe\u4e0a\u6253\u70b9\u53ca\u8def\u7ebf\u3002"}</div>
    </div>
  );
}