import React, { useEffect, useRef, useState } from "react";
import { startListening, stopListening } from "../services/speech";
import { saveExpense, listExpenses, deleteExpense } from "../services/supabase";

type Expense = { id?: string; amount: number; category: string; note: string };

const CATS = ["\u9910\u996e", "\u4ea4\u901a", "\u95e8\u7968", "\u4f4f\u5bbf", "\u8d2d\u7269", "\u5176\u4ed6"];

export default function ExpenseVoice() {
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>("\u5176\u4ed6");
  const [note, setNote] = useState<string>("");
  const [rows, setRows] = useState<Expense[]>([]);
  const recRef = useRef<any>(null);

  useEffect(() => { refresh(); }, []);
  const refresh = async () => {
    const data = await listExpenses();
    setRows(data || []);
  };

  const parseSpeech = (txt: string) => {
    const num = Number((txt.match(/\d+(\.\d+)?/) || [0])[0]);
    const cat = CATS.find(c => txt.includes(c)) || "\u5176\u4ed6";
    const n = txt.replace(/\d+(\.\d+)?/, "").replace(cat, "").trim();
    setAmount(num || 0);
    setCategory(cat);
    setNote(n);
  };

  const onMic = () => {
    startListening({
      onStart: (rec) => { recRef.current = rec; },
      onResult: (txt) => { parseSpeech(txt); stopListening(recRef.current); }
    });
  };

  const onSave = async () => {
    if (!amount || !category) { alert("\u8bf7\u586b\u5199\u91d1\u989d\u4e0e\u5206\u7c7b"); return; }
    const ok = await saveExpense({ amount, category, note });
    if (!ok) { alert("\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u767b\u5f55\u4e0e Supabase \u914d\u7f6e"); return; }
    setAmount(0); setCategory("\u5176\u4ed6"); setNote("");
    refresh();
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    await deleteExpense(id);
    refresh();
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label>{"\u91d1\u989d"}</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
        </div>
        <div>
          <label>{"\u5206\u7c7b"}</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label>{"\u5907\u6ce8"}</label>
          <input value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={onMic}>{"\u8bed\u97f3\u8f93\u5165"}</button>
        <button style={{ marginLeft: 8 }} onClick={onSave}>{"\u4fdd\u5b58\u8bb0\u5f55"}</button>
      </div>

      <h3 style={{ marginTop: 16 }}>{"\u5df2\u8bb0\u5f55"}</h3>
      <div>
        {rows.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #eee", padding: 6 }}>
            <div style={{ width: 80 }}>{r.category}</div>
            <div style={{ width: 80 }}>{r.amount}</div>
            <div style={{ flex: 1 }}>{r.note}</div>
            <button onClick={() => onDelete(r.id)}>{"\u5220\u9664"}</button>
          </div>
        ))}
        {rows.length === 0 && <div>{"\u6682\u65e0\u8bb0\u5f55"}</div>}
      </div>
    </div>
  );
}