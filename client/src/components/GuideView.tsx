import React from "react";

export default function GuideView({ plan }: { plan: any }) {
  if (!plan) return null;

  const toStr = (v: any) => (v == null ? "" : String(v));
  const safeName = (act: any) => (typeof act === "string" ? act.replace(/^[^\uff1a:]*[\uff1a:]\s*/, "") : (act?.name || ""));
  const safeSlot = (act: any) => (typeof act === "string" ? (act.split(/[\uff1a:]/)[0] || "") : (act?.timeSlot || ""));
  const safeAddr = (act: any) => (typeof act === "object" ? (act?.address || "") : "");
  const safeDesc = (act: any) => (typeof act === "object" ? (act?.description || "") : "");
  const safeOpen = (act: any) => (typeof act === "object" ? (act?.openTime || "") : "");
  const safePrice = (act: any) => (typeof act === "object" ? (act?.ticketPrice || "") : "");
  const safeTips = (act: any) => (typeof act === "object" ? (act?.tips || "") : "");
  const daysData = Array.isArray(plan.days) ? plan.days : [];

  return (
    <div style={{ lineHeight: 1.6 }}>
      <h3 style={{ marginTop: 0 }}>{"\u4eba\u6027\u5316\u65c5\u6e38\u653b\u7565"}</h3>

      <div style={{ marginTop: 8 }}>
        <h4>{"\u884c\u524d\u51c6\u5907"}</h4>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>{`\u76ee\u7684\u5730\uff1a${plan?.destination || ""}\uFF0C\u5929\u6570\uff1a${plan?.days?.length || ""}\uFF0C\u4eba\u6570\uff1a${plan?.people ?? ""}\uFF0C\u9884\u7b97\uff1a${plan?.budget ?? ""}`}</li>
          <li>{`\u4fe1\u606f\u641c\u96c6\uff1a\u4e86\u89e3\u5730\u56fe\u5206\u5e03\u3001\u6c14\u5019\u548c\u6700\u4f73\u5b63\u8282\uFF0C\u70ed\u95e8\u666f\u70b9\u63d0\u524d\u9884\u8d2d\u3002`}</li>
          <li>{`\u884c\u7a0b\u89c4\u5212\uff1a\u5c3d\u91cf\u5c06\u76f8\u90bb\u666f\u70b9\u5b89\u6392\u4e00\u5929\uFF0C\u907f\u514d\u8fd0\u8f93\u56de\u5934\u8def\uFF0C\u63d0\u9ad8\u65f6\u95f4\u5229\u7528\u6548\u7387\u3002`}</li>
          <li>{`\u7269\u54c1\u6e05\u5355\uff1a\u8eab\u4efd\u8bc1\u3001\u5145\u7535\u5668\u3001\u5e26\u836f\u7b49\uFF0C\u7279\u6b8a\u73af\u5883\u6dfb\u52a0\u9632\u6652/\u9632\u62a4\u3002`}</li>
        </ul>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>{"\u6bcf\u65e5\u884c\u7a0b"}</h4>
        <div style={{ color: "#666", fontSize: 13 }}>{plan.summary || ""}</div>
        {daysData.map((d: any, i: number) => {
          const acts = Array.isArray(d.activities) ? d.activities : [];
          const route = d.route?.order || [];
          return (
            <div key={i} style={{ marginTop: 8, padding: 8, border: "1px dashed #ddd", borderRadius: 6 }}>
              <div style={{ fontWeight: 600 }}>{`\u7b2c ${d.day || (i + 1)} \u5929`}</div>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {acts.map((act: any, idx: number) => (
                  <li key={idx}>
                    <span style={{ color: "#555" }}>{safeSlot(act) ? `${safeSlot(act)}\uff1a` : ""}</span>
                    <span style={{ fontWeight: 500 }}>{safeName(act)}</span>
                    {safeAddr(act) ? <span style={{ color: "#999" }}>{` \u00b7 ${safeAddr(act)}`}</span> : null}
                    {safeDesc(act) ? <div style={{ fontSize: 12, color: "#666" }}>{safeDesc(act)}</div> : null}
                    {(safeOpen(act) || safePrice(act)) ? (
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {safeOpen(act) ? `\u5f00\u653e\u65f6\u95f4\uff1a${safeOpen(act)} ` : ""}
                        {safePrice(act) ? `\u95e8\u7968\uff1a${safePrice(act)}` : ""}
                      </div>
                    ) : null}
                    {safeTips(act) ? <div style={{ fontSize: 12, color: "#999" }}>{`\u5c0f\u63d0\u793a\uff1a${safeTips(act)}`}</div> : null}
                  </li>
                ))}
              </ul>
              {route.length ? (
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                  {`\u5efa\u8bae\u8def\u7ebf\u987a\u5e8f\uff1a${route.join(" \u2192 ")}`}
                </div>
              ) : null}
              {d.notes ? <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{d.notes}</div> : null}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>{"\u4ea4\u901a\u6307\u5357"}</h4>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(plan.transport || []).map((t: string, i: number) => <li key={i}>{t}</li>)}
          <li>{`\u5185\u90e8\u884c\u7a0b\u5efa\u8bae\uff1a\u4ee5\u516c\u4ea4\u548c\u6b65\u884c\u4f18\u5148\uFF0C\u8ddd\u79bb\u8fdc\u65f6\u8003\u8651\u51fa\u79df\u8f66/\u9a7e\u8f66\u3002`}</li>
        </ul>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>{"\u4f4f\u5bbf\u5efa\u8bae"}</h4>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(plan.hotels || []).map((h: string, i: number) => <li key={i}>{h}</li>)}
          <li>{`\u9760\u8fd1\u5730\u94c1\u7ad9/\u5546\u5708\uFF0C\u63d0\u9ad8\u51fa\u884c\u6548\u7387\u548c\u5165\u4f4f\u4fbf\u5229\u6027\u3002`}</li>
        </ul>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>{"\u9910\u996e\u63a8\u8350"}</h4>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(plan.restaurants || []).map((r: string, i: number) => <li key={i}>{r}</li>)}
          <li>{`\u63a2\u7d22\u7f8e\u98df\u8857/\u8001\u5c0f\u5e97\uFF0C\u52a0\u7d27\u7f50\u5939\u6216\u5c0f\u7f55\u98df\u7269\uFF0C\u5c3d\u91cf\u5c0f\u7f55\u5c0f\u5403\u3002`}</li>
        </ul>
      </div>
    </div>
  );
}