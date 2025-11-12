const LLM_KEY = "llm_api_key";
const AMAP_KEY = "amap_key";
const AMAP_SECURITY_KEY = "amap_security_key";
const SUPABASE_URL_KEY = "supabase_url";
const SUPABASE_ANON_KEY = "supabase_anon";

export function getLLMKey() {
  return localStorage.getItem(LLM_KEY) || "";
}
export function setLLMKey(v: string) {
  localStorage.setItem(LLM_KEY, v || "");
}

export function getAMapKey() {
  return localStorage.getItem(AMAP_KEY) || "";
}
export function setAMapKey(v: string) {
  localStorage.setItem(AMAP_KEY, v || "");
}

export function getAMapSecKey() {
  return localStorage.getItem(AMAP_SECURITY_KEY) || "";
}
export function setAMapSecKey(v: string) {
  localStorage.setItem(AMAP_SECURITY_KEY, v || "");
}
export function getSupabaseUrl() {
  return localStorage.getItem(SUPABASE_URL_KEY) || "";
}
export function setSupabaseUrlKey(v: string) {
  localStorage.setItem(SUPABASE_URL_KEY, v || "");
}

export function getSupabaseAnonKey() {
  return localStorage.getItem(SUPABASE_ANON_KEY) || "";
}
export function setSupabaseAnonKey(v: string) {
  localStorage.setItem(SUPABASE_ANON_KEY, v || "");
}