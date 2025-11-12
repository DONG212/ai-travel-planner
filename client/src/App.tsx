import React, { useEffect, useState } from "react";
import ItineraryPlanner from "./components/ItineraryPlanner";
import Settings from "./components/Settings";
import Auth from "./components/Auth";
import Plans from "./components/Plans";
import { getAMapKey, getAMapSecKey } from "./services/config";
import MultiDayMap from "./components/MultiDayMap";
import ExpenseVoice from "./components/ExpenseVoice";

export default function App() {
  const [tab, setTab] = useState<"plan" | "settings" | "auth" | "plans" | "map" | "expense">("plan");

  useEffect(() => {
    const key = getAMapKey();
    const sec = getAMapSecKey?.() || "";
    if (key && !document.getElementById("amap-sdk")) {
      if (sec && !document.getElementById("amap-sec")) {
        const sc = document.createElement("script");
        sc.id = "amap-sec";
        sc.innerHTML = `window._AMapSecurityConfig = { securityJsCode: "${sec}" }`;
        document.head.appendChild(sc);
      }
      const s = document.createElement("script");
      s.id = "amap-sdk";
      s.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
      s.onload = () => {
        const AMap = (window as any).AMap;
        if (!AMap) return;
        const map = new AMap.Map("map", { viewMode: "2D", zoom: 11, center: [116.397428, 39.90923] });
        AMap.plugin(["AMap.Scale", "AMap.ToolBar"], () => {
          map.addControl(new AMap.Scale());
          map.addControl(new AMap.ToolBar());
        });
        // 暴露到全局，便于其它组件使用
        (window as any).__AI_TRAVEL_MAP__ = map;
        console.log("AMap initialized");
      };
      s.onerror = () => console.error("AMap SDK failed to load");
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      {/* 顶部导航区域，不要使用裸露块注释 */}
      <h1>{"AI \u65c5\u884c\u89c4\u5212\u5e08"}</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setTab("plan")}>{"\u884c\u7a0b\u89c4\u5212"}</button>
        <button onClick={() => setTab("settings")} style={{ marginLeft: 8 }}>{"\u8bbe\u7f6e"}</button>
        <button onClick={() => setTab("auth")} style={{ marginLeft: 8 }}>{"\u767b\u5f55"}</button>
        <button onClick={() => setTab("plans")} style={{ marginLeft: 8 }}>{"\u6211\u7684\u8ba1\u5212"}</button>
        <button onClick={() => setTab("map")} style={{ marginLeft: 8 }}>{"\u5730\u56fe\u5207\u6362"}</button>
        <button onClick={() => setTab("expense")} style={{ marginLeft: 8 }}>{"\u8bb0\u8d26"}</button>
      </div>
      {tab === "plan" ? <ItineraryPlanner /> : null}
      {tab === "settings" ? <Settings /> : null}
      {tab === "auth" ? <Auth /> : null}
      {tab === "plans" ? <Plans /> : null}
      {tab === "map" ? <MultiDayMap /> : null}
      {tab === "expense" ? <ExpenseVoice /> : null}
      <div id="map" style={{ marginTop: 16, width: "100%", height: 320, border: "1px solid #ddd" }}></div>
    </div>
  );
}