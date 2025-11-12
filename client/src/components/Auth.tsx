import React, { useEffect, useState } from "react";
import { getSupabase, signIn, signUp, signOut, getCurrentUser, onAuthStateChanged } from "../services/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUserEmail(u?.email || null);
    })();
    onAuthStateChanged(async () => {
      const u = await getCurrentUser();
      setUserEmail(u?.email || null);
    });
  }, []);

  const onSignUp = async () => {
    setMsg("");
    const r = await signUp(email, password);
    // 邮件未配置时，Supabase 可能返回需要邮件验证的提示
    setMsg(r.ok ? "\u6ce8\u518c\u6210\u529f\uff0c\u5982\u542f\u7528\u4e86\u90ae\u4ef6\u9a8c\u8bc1\u8bf7\u5148\u5728\u90ae\u7bb1\u786e\u8ba4\u3002" : `\u6ce8\u518c\u5931\u8d25\uff1a${r.message}`);
  };

  const onSignInClick = async () => {
    setMsg("");
    const r = await signIn(email, password);
    const u = await getCurrentUser();
    setUserEmail(u?.email || null);
    if (r.ok) {
      setMsg("\u767b\u5f55\u6210\u529f\u3002");
    } else {
      // 常见错误：Email not confirmed、Invalid login credentials、Auth config
      setMsg(`\u767b\u5f55\u5931\u8d25\uff1a${r.message || "\u8bf7\u68c0\u67e5\u90ae\u7bb1/\u5bc6\u7801\u4e0e Supabase \u914d\u7f6e"}`);
    }
  };

  const onSignOutClick = async () => {
    const r = await signOut();
    setUserEmail(null);
    setMsg(r.ok ? "\u5df2\u767b\u51fa\u3002" : `\u767b\u51fa\u5f02\u5e38\uff1a${r.message}`);
  };

  const sb = getSupabase();
  if (!sb) {
    return <div>{"\u8bf7\u5148\u5728\u201c\u8bbe\u7f6e\u201d\u9875\u914d\u7f6e Supabase URL \u4e0e Anon Key\u3002"}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>{"\u5f53\u524d\u7528\u6237\uff1a"}{userEmail || "\u672a\u767b\u5f55"}</div>
      {userEmail ? (
        <button onClick={onSignOutClick}>{"\u767b\u51fa"}</button>
      ) : (
        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <input placeholder="\u90ae\u7bb1" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="\u5bc6\u7801" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onSignInClick}>{"\u767b\u5f55"}</button>
            <button onClick={onSignUp}>{"\u6ce8\u518c"}</button>
          </div>
          {msg ? <div>{msg}</div> : null}
        </div>
      )}
    </div>
  );
}