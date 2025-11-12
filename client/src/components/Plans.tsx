import React, { useEffect, useState } from "react";
import { getCurrentUser, listPlans, deletePlan } from "../services/supabase";
import GuideView from "./GuideView";

export default function Plans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    const u = await getCurrentUser();
    if (!u) {
      setMsg("\u672a\u767b\u5f55\uff0c\u8bf7\u5148\u5230\u201c\u767b\u5f55\u201d\u9875\u767b\u5f55\u3002");
      return;
    }
    const rows = await listPlans();
    setPlans(rows);
    setMsg("");
  };

  useEffect(() => {
    refresh();
  }, []);

  const onDelete = async (id: string) => {
    await deletePlan(id);
    await refresh();
  };

  return (
    <div>
      <button onClick={refresh}>{"\u5237\u65b0"}</button>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
      <div style={{ marginTop: 12 }}>
        {plans.map(p => (
          <div key={p.id} style={{ border: "1px solid #ddd", padding: 8, marginBottom: 8, background: "#fff", borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div><b>{p.destination}</b> {"\u00b7"} {p.days} {"\u5929"} {"\u00b7"} {p.people} {"\u4eba"} {"\u00b7"} {"\u9884\u7b97 "} {p.budget}</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{"\u521b\u5efa\u4e8e "} {new Date(p.created_at).toLocaleString()}</div>
            {/* 使用与生成页一致的人类可读攻略视图 */}
            <GuideView plan={p.plan} />
            <div style={{ marginTop: 8 }}>
              <button onClick={() => onDelete(p.id)}>{"\u5220\u9664"}</button>
            </div>
          </div>
        ))}
        {plans.length === 0 && <div>{"\u6682\u65e0\u8ba1\u5212"}</div>}
      </div>
    </div>
  );
}