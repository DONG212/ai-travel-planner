import React, { useState, useEffect } from "react";
import { getLLMKey, setLLMKey, getAMapKey, setAMapKey, getAMapSecKey, setAMapSecKey } from "../services/config";
import { getSupabaseUrl, setSupabaseUrlKey, getSupabaseAnonKey, setSupabaseAnonKey } from "../services/config";

export default function Settings() {
  const [llmKey, setLlmKey] = useState("");
  const [amapKey, setAmapKey] = useState("");
  const [amapSecKey, setAmapSecKey] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnon, setSupabaseAnon] = useState("");

  useEffect(() => {
    setLlmKey(getLLMKey() || "");
    setAmapKey(getAMapKey() || "");
    setAmapSecKey(getAMapSecKey() || "");
    setSupabaseUrl(getSupabaseUrl() || "");
    setSupabaseAnon(getSupabaseAnonKey() || "");
  }, []);

  return (
    <div>
      <p>{"\u5207\u8bb0\u4e0d\u8981\u5c06\u4efb\u4f55 API key \u5199\u5728\u4ee3\u7801\u4e2d\u3002\u8bf7\u5728\u6b64\u8f93\u5165\u5e76\u4fdd\u5b58\u3002"}</p>
      <div style={{ marginBottom: 12 }}>
        <label>LLM API Key\uff1a</label>
        <input style={{ width: 400 }} value={llmKey} onChange={e => setLlmKey(e.target.value)} />
        <button style={{ marginLeft: 8 }} onClick={() => setLLMKey(llmKey)}>{"\u4fdd\u5b58"}</button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>AMap Key\uff1a</label>
        <input style={{ width: 400 }} value={amapKey} onChange={e => setAmapKey(e.target.value)} />
        <button style={{ marginLeft: 8 }} onClick={() => setAMapKey(amapKey)}>{"\u4fdd\u5b58"}</button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>{"AMap \u5b89\u5168\u5bc6\u94a5\uff08securityJsCode\uff09\uff1a"}</label>
        <input style={{ width: 400 }} value={amapSecKey} onChange={e => setAmapSecKey(e.target.value)} />
        <button style={{ marginLeft: 8 }} onClick={() => setAMapSecKey(amapSecKey)}>{"\u4fdd\u5b58"}</button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Supabase URL\uff1a</label>
        <input style={{ width: 400 }} value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)} />
        <button style={{ marginLeft: 8 }} onClick={() => setSupabaseUrlKey(supabaseUrl)}>{"\u4fdd\u5b58"}</button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Supabase Anon Key\uff1a</label>
        <input style={{ width: 400 }} value={supabaseAnon} onChange={e => setSupabaseAnon(e.target.value)} />
        <button style={{ marginLeft: 8 }} onClick={() => setSupabaseAnonKey(supabaseAnon)}>{"\u4fdd\u5b58"}</button>
      </div>
      <p>{"\u4fdd\u5b58\u540e\u5230\u201c\u767b\u5f55\u201d\u9875\u8fdb\u884c\u90ae\u7bb1\u767b\u5f55\uff0c\u518d\u7528\u201c\u6211\u7684\u8ba1\u5212\u201d\u9875\u67e5\u770b\u4e0e\u7ba1\u7406\u4e91\u7aef\u8ba1\u5212\u3002"}</p>
    </div>
  );
}