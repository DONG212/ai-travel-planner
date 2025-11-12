// 顶部导入与客户端初始化
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseAnonKey } from "./config";

let client: SupabaseClient | null = null;

export function getSupabase() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  return client;
}

export async function getCurrentUser() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user;
}

// 将 signUp/signIn/signOut 返回结构统一为 { ok, message }
export async function signUp(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Supabase 未配置" };
  const { error } = await sb.auth.signUp({ email, password });
  return { ok: !error, message: error?.message || "" };
}

export async function signIn(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Supabase 未配置" };
  const { error } = await sb.auth.signInWithPassword({ email, password });
  return { ok: !error, message: error?.message || "" };
}

export async function signOut() {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Supabase 未配置" };
  const { error } = await sb.auth.signOut();
  return { ok: !error, message: error?.message || "" };
}

// 监听登录状态变化，供 Auth.tsx 调用
export function onAuthStateChanged(cb: () => void) {
  const sb = getSupabase();
  if (!sb) return () => {};
  const { data: { subscription } } = sb.auth.onAuthStateChange((_event, _session) => {
    cb();
  });
  return () => {
    try { subscription?.unsubscribe(); } catch {}
  };
}

type PlanRow = {
  destination: string;
  days: number;
  budget: number;
  people: number;
  preferences: string[];
  plan: any;
};

export async function savePlan(row: PlanRow) {
  const sb = getSupabase();
  if (!sb) return false;
  const u = await getCurrentUser();
  if (!u) return false;
  const { error } = await sb.from("plans").insert({
    user_id: u.id,
    destination: row.destination,
    days: row.days,
    budget: row.budget,
    people: row.people,
    preferences: row.preferences,
    plan: row.plan
  });
  return !error;
}

export async function listPlans() {
  const sb = getSupabase();
  if (!sb) return [];
  const u = await getCurrentUser();
  if (!u) return [];
  const { data } = await sb.from("plans").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function deletePlan(id: string) {
  const sb = getSupabase();
  if (!sb) return false;
  const u = await getCurrentUser();
  if (!u) return false;
  const { error } = await sb.from("plans").delete().eq("id", id);
  return !error;
}

type ExpenseRow = {
  amount: number;
  category: string;
  note: string;
};

export async function saveExpense(row: ExpenseRow) {
  const sb = getSupabase();
  if (!sb) return false;
  const u = await getCurrentUser();
  if (!u) return false;
  const { error } = await sb.from("expenses").insert({
    user_id: u.id, amount: row.amount, category: row.category, note: row.note
  });
  return !error;
}

export async function listExpenses() {
  const sb = getSupabase();
  if (!sb) return [];
  const u = await getCurrentUser();
  if (!u) return [];
  const { data } = await sb.from("expenses").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function deleteExpense(id: string) {
  const sb = getSupabase();
  if (!sb) return false;
  const u = await getCurrentUser();
  if (!u) return false;
  const { error } = await sb.from("expenses").delete().eq("id", id);
  return !error;
}