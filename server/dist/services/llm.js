import fetch from "node-fetch";
const LLM_CACHE = new Map();
const LLM_CACHE_TTL_MS = Number(process.env.LLM_CACHE_TTL_MS || 600000); // 10 min
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 9000);
export async function generateItinerary(input, opts) {
    if (opts.provider === "MOCK") {
        // ʹ�þ����򿨵� + ���꣬����ÿ���ظ�
        const tokyoSpots = [
            { name: "\u6d85\u53c8\u753a\u53e3\u4ea4\u53c9\u8def", address: "\u6df1\u8c37\u7ad9\u9644\u8fd1", city: "\u4e1c\u4eac", lat: 35.6595, lng: 139.7005 },
            { name: "\u6dfb\u4e66\u5bfa", address: "\u6df1\u8c37\u533a", city: "\u4e1c\u4eac", lat: 35.6581, lng: 139.7017 },
            { name: "\u65b0\u5bbf\u5fa1\u82d1", address: "\u65b0\u5bbf\u533a", city: "\u4e1c\u4eac", lat: 35.685176, lng: 139.710052 },
            { name: "\u6b21\u5e7f\u573a\u7cbe\u54c1\u9910\u5385", address: "\u6df1\u8c37\u533a", city: "\u4e1c\u4eac", lat: 35.661, lng: 139.704 },
            { name: "\u4e0a\u91ce\u52a8\u7269\u56ed", address: "\u53f0\u4e95\u533a", city: "\u4e1c\u4eac", lat: 35.7153, lng: 139.7713 },
            { name: "\u4e0a\u91ce\u516c\u56ed\u7f8e\u672f\u9986", address: "\u53f0\u4e95\u533a", city: "\u4e1c\u4eac", lat: 35.714, lng: 139.775 },
            { name: "\u79cb\u53f6\u539f\u753a", address: "\u5343\u4ee3\u753a", city: "\u4e1c\u4eac", lat: 35.698, lng: 139.773 },
            { name: "\u94f6\u5ea7\u5546\u5708", address: "\u4e0a\u4e09\u5b89\u533a", city: "\u4e1c\u4eac", lat: 35.6719, lng: 139.765 },
            { name: "\u67f3\u7530\u5168\u5bb6\u7f8e\u98df", address: "\u4e0a\u4e09\u5b89\u533a", city: "\u4e1c\u4eac", lat: 35.669, lng: 139.765 },
            { name: "\u53f0\u5730\u7f8e\u6d32", address: "\u6a2a\u4e01", city: "\u4e1c\u4eac", lat: 35.620, lng: 139.775 }
        ];
        const prefs = input.preferences.length ? input.preferences : ["\u7f8e\u98df", "\u52a8\u6f2b", "\u4eb2\u5b50"];
        const pick = (i) => [tokyoSpots[(i * 2) % tokyoSpots.length], tokyoSpots[(i * 2 + 1) % tokyoSpots.length], tokyoSpots[(i * 2 + 2) % tokyoSpots.length]];
        const makeDay = (i) => {
            const [m, a, e] = pick(i);
            const withDetails = (slot, spot) => ({
                timeSlot: slot,
                ...spot,
                description: "\u4eba\u6d41\u70ed\u70b9\uFF0C\u62cd\u7167\u6253\u5361\u4E0D\u5F97\u9519\u8FC7\u3002",
                openTime: "\u6BCF\u65E5 9:00-18:00",
                ticketPrice: "\u65E0/\u6216\u5C0F\u7C73\u8D39\u7528",
                tips: "\u5EFA\u8BAE\u65E9\u5230\uFF0C\u907F\u5F00\u9AD8\u5CF0\u4EBA\u6D41\u3002"
            });
            const activities = [
                withDetails("\u4e0a\u5348", m),
                withDetails("\u4e0b\u5348", a),
                withDetails("\u665a\u4e0a", e)
            ];
            return { day: i + 1, activities, notes: `\u504f\u597d\u4f18\u5148\uff1a${prefs[i % prefs.length]}`, route: { order: activities.map(x => x.name) } };
        };
        return {
            summary: `\u4e3a ${input.people} \u4eba\u5728 ${input.destination} \u7684 ${input.days} \u5929\u884c\u7a0b\uff0c\u9884\u7b97\u7ea6 ${input.budget}\u3002\u504f\u597d\uff1a${prefs.join("\u3001")}`,
            days: Array.from({ length: input.days }).map((_, i) => makeDay(i)),
            transport: ["\u5730\u94c1", "\u51fa\u79df\u8f66", "\u6b65\u884c"],
            hotels: ["\u65b0\u5bbf\u7cbe\u54c1\u9152\u5e97", "\u6df1\u8c37\u4e3b\u9898\u9152\u5e97"],
            restaurants: ["\u6df1\u8c37\u7f8e\u98df\u8857", "\u94f6\u5ea7\u7cbe\u54c1\u9910\u5385"]
        };
    }
    if (opts.provider === "OPENAI") {
        const body = {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "\u4f60\u662f\u65c5\u884c\u89c4\u5212\u52a9\u624b\u3002\u8bf7\u4ec5\u4ee5\u7eaf JSON \u8f93\u51fa\u3002JSON schema: { summary: string, days: [{ day: number, activities: [{ timeSlot: '\u4e0a\u5348|\u4e0b\u5348|\u665a\u4e0a', name: string, address?: string, city?: string, lat?: number, lng?: number }], notes?: string, route: { order: string[] } }], transport: string[], hotels: string[], restaurants: string[] } \u8981\u6c42\uff1a\u6bcf\u5929\u5185\u5bb9\u4e0d\u5f97\u91cd\u590d\uff0c\u4e3a\u5bb6\u5e38\u6536\u85cf\u7684\u5173\u952e\u6253\u5361\u70b9\u3002\u6709\u5750\u6807\u5c31\u586b lat/lng\uff0c\u6ca1\u6709\u5c31\u7559\u7a7a\u3002" },
                { role: "user", content: `\u76ee\u7684\u5730\uff1a${input.destination}\uff1b\u5929\u6570\uff1a${input.days}\uff1b\u9884\u7b97\uff1a${input.budget}\uff1b\u4eba\u6570\uff1a${input.people}\uff1b\u504f\u597d\uff1a${input.preferences.join(",")}` }
            ]
        };
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${opts.apiKey}` },
            body: JSON.stringify(body)
        });
        if (!resp.ok)
            throw new Error(`OpenAI error: ${resp.status}`);
        const json = await resp.json();
        const text = json.choices?.[0]?.message?.content || "";
        try {
            const parsed = JSON.parse(text);
            return parsed;
        }
        catch {
            return { summary: text || "\u89c4\u5212\u751f\u6210\u5931\u8d25", days: [], transport: [], hotels: [], restaurants: [] };
        }
    }
    if (opts.provider === "DASHSCOPE") {
        const model = process.env.DASHSCOPE_MODEL || "qwen-plus";
        const structure = `\u8bf7\u4ec5\u8fd4\u56de\u7eaf JSON\uff0c\u4e0d\u8981\u5176\u4ed6\u6587\u672c\u3002
       JSON schema:
       {
         "summary": "string",
         "days": [{
           "day": "number",
           "activities": [{
             "timeSlot": "\u4e0a\u5348|\u4e0b\u5348|\u665a\u4e0a",
             "name": "string",
             "address": "string(optional)",
             "city": "string(optional)",
             "lat": "number(optional)",
             "lng": "number(optional)",
             "description": "string(optional)",
             "openTime": "string(optional)",
             "ticketPrice": "string(optional)",
             "tips": "string(optional)"
           }],
           "notes": "string(optional)",
           "route": { "order": ["<activity name 1>", "<activity name 2>", "<activity name 3>"] }
         }],
         "transport": ["string"],
         "hotels": ["string"],
         "restaurants": ["string"]
       }
       \u8981\u6c42\uff1a
       - \u6bcf\u5929\u5185\u5bb9\u4e0d\u91cd\u590d\uff0c\u7ed9\u51fa\u5177\u4f53\u5730\u5740\u6216\u540d\u79f0\uFF0C\u6709\u5750\u6807\u4F9D\u7167 lat/lng \u586B\u5199\u3002
       - \u4F18\u5148\u7F8E\u98DF/\u52A8\u6F2B/\u4EB2\u5B50\u7B49\u504F\u597D\uFF0C\u5F00\u653E\u65F6\u95F4\u3001\u95E8\u7968\u3001\u7B80\u4ECB\u548C\u5C0F\u63D0\u793A\u5C3D\u91CF\u586B\u5199\u3002
       - \u8DEF\u7EBF\u987A\u5E8F\u4EE5 route.order \u4E3A\u51C6\uFF0C\u907F\u514D\u56DE\u5934\u8DEF\u3002`;
        const body = {
            model,
            input: { prompt: `\u76EE\u7684\u5730:${input.destination}\uFF0C\u5929\u6570:${input.days}\uFF0C\u9884\u7B97:${input.budget}\uFF0C\u4EBA\u6570:${input.people}\uFF0C\u504F\u597D:${input.preferences.join(",")}\n${structure}` },
            parameters: { result_format: "text" }
        };
        const cacheKey = `${opts.provider}:${input.destination}:${input.days}:${input.budget}:${input.people}:${(input.preferences || []).join(",")}`;
        const now = Date.now();
        const cached = LLM_CACHE.get(cacheKey);
        if (cached && (now - cached.ts) < LLM_CACHE_TTL_MS) {
            return cached.data;
        }
        const resp = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${opts.apiKey}` },
            body: JSON.stringify(body)
        });
        if (!resp.ok)
            throw new Error(`DashScope error: ${resp.status}`);
        const json = await resp.json();
        const text = json.output?.text || "";
        try {
            const parsed = JSON.parse(text);
            return parsed;
        }
        catch {
            return { summary: text || "\u89c4\u5212\u751f\u6210\u5931\u8d25", days: [], transport: [], hotels: [], restaurants: [] };
        }
    }
    throw new Error("Unsupported provider");
}
export async function estimateBudget(input, opts) {
    if (opts.provider === "MOCK") {
        const base = input.days * input.people * 500;
        return {
            total: base,
            breakdown: { transport: base * 0.3, hotels: base * 0.4, food: base * 0.2, tickets: base * 0.1 }
        };
    }
    const prompt = `\u6839\u636e\u4ee5\u4e0b\u884c\u7a0b\u6982\u8981\u4f30\u7b97\u9884\u7b97\uff08\u542b\u4ea4\u901a\u3001\u4f4f\u5bbf\u3001\u9910\u996e\u3001\u95e8\u7968\uff09\uff1a${input.planSummary}\uff1b\u76ee\u7684\u5730${input.destination}\uff1b\u5929\u6570${input.days}\uff1b\u4eba\u6570${input.people}`;
    if (opts.provider === "OPENAI") {
        const body = {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "\u4f60\u662f\u65c5\u884c\u89c4\u5212\u52a9\u624b\u3002\u8bf7\u4ec5\u4ee5\u7eaf JSON \u8f93\u51fa\u3002JSON schema: { summary: string, days: [{ day: number, activities: [{ timeSlot: '\u4e0a\u5348|\u4e0b\u5348|\u665a\u4e0a', name: string, address?: string, city?: string, lat?: number, lng?: number }], notes?: string, route: { order: string[] } }], transport: string[], hotels: string[], restaurants: string[] } \u8981\u6c42\uff1a\u6bcf\u5929\u5185\u5bb9\u4e0d\u5f97\u91cd\u590d\uff0c\u4e3a\u5bb6\u5e38\u6536\u85cf\u7684\u5173\u952e\u6253\u5361\u70b9\u3002\u6709\u5750\u6807\u5c31\u586b lat/lng\uff0c\u6ca1\u6709\u5c31\u7559\u7a7a\u3002" },
                { role: "user", content: `\u76ee\u7684\u5730\uff1a${input.destination}\uff1b\u5929\u6570\uff1a${input.days}\uff1b\u9884\u7b97\uff1a${input.budget}\uff1b\u4eba\u6570\uff1a${input.people}\uff1b\u504f\u597d\uff1a${input.preferences.join(",")}` }
            ]
        };
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${opts.apiKey}` },
            body: JSON.stringify(body)
        });
        if (!resp.ok)
            throw new Error(`OpenAI error: ${resp.status}`);
        const json = await resp.json();
        const text = json.choices?.[0]?.message?.content || "";
        try {
            const parsed = JSON.parse(text);
            return parsed;
        }
        catch {
            return { summary: text || "\u89c4\u5212\u751f\u6210\u5931\u8d25", days: [], transport: [], hotels: [], restaurants: [] };
        }
    }
    if (opts.provider === "DASHSCOPE") {
        const model = process.env.DASHSCOPE_MODEL || "qwen-plus";
        const structure = `\u8bf7\u4ec5\u8fd4\u56de\u7eaf JSON\uff0c\u4e0d\u8981\u5176\u4ed6\u6587\u672c\u3002
       JSON schema:
       {
         "summary": "string",
         "days": [{
           "day": "number",
           "activities": [{
             "timeSlot": "\u4e0a\u5348|\u4e0b\u5348|\u665a\u4e0a",
             "name": "string",
             "address": "string(optional)",
             "city": "string(optional)",
             "lat": "number(optional)",
             "lng": "number(optional)"
           }],
           "notes": "string(optional)",
           "route": { "order": ["<activity name 1>", "<activity name 2>", "<activity name 3>"] }
         }],
         "transport": ["string"],
         "hotels": ["string"],
         "restaurants": ["string"]
       }
       \u8981\u6c42\uff1a
       - \u6bcf\u5929\u5185\u5bb9\u4e0d\u5f97\u91cd\u590d\uff0c\u4e0d\u540c\u504f\u597d\u548c\u5730\u70b9\u3002
       - \u7ed9\u51fa\u5177\u4f53\u5730\u5740/\u540d\u79f0\uff0c\u4fbf\u4e8e\u5730\u7406\u7f16\u7801\uff1b\u6709\u5750\u6807\u5219\u4f9d\u7167 lat/lng \u586b\u5199\u3002
       - \u8def\u7ebf\u987a\u5e8f\u4ee5 route.order \u4e3a\u51c6\u3002`;
        const prompt = `������ش� JSON����Ҫ�����κζ����ı���JSON ��������ֶΣ�
       summary: �ַ���������ժҪ��
       days: ���飬ÿ��Ϊ���� { day: �������, activities: [ "���磺<�ص��>", "���磺<�ص��>", "���ϣ�<�ص��>" ], notes: ��ѡ˵�� }��
       transport: �ַ������飨�� ����/���⳵/����/����/����/�ɻ�����
       hotels: �ַ������飨�Ƽ��Ƶ����ƣ�����������������
       restaurants: �ַ������飨�Ƽ��������ƣ�����������������
       Ҫ��
       - �������û�ƫ�ã�${input.preferences.join("��") || "��"}�����ɲ��컯��ÿ�հ��ţ������ظ���
       - ����������ʵ�������硰����ܥ��ʳ�֡�����Ұ����԰���ȣ�������ǰ�˵������롣
       - ע������/����/��ʳƫ�÷ֱ�����ʺϵĵص����
       - ����ÿ���г�ǿ�Ⱥ���������/��ͨʱ�䣩���������������ɻ��
       - �����������Ч JSON��`;
        const body = { model, input: `Ŀ�ĵأ�${input.destination}��������${input.days}��Ԥ�㣺${input.budget}��������${input.people}��ƫ�ã�${input.preferences.join(",")}
       ${prompt}`
        };
        const resp = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${opts.apiKey}` },
            body: JSON.stringify(body)
        });
        if (!resp.ok)
            throw new Error(`DashScope error: ${resp.status}`);
        const json = await resp.json();
        const text = json.output?.text || "";
        try {
            const parsed = JSON.parse(text);
            return parsed;
        }
        catch {
            // ���ף���ģ�ͷ��ط� JSON������ժҪ�������ֶ��ÿ�
            return { summary: text || "\u89c4\u5212\u751f\u6210\u5931\u8d25", days: [], transport: [], hotels: [], restaurants: [] };
        }
    }
    throw new Error("Unsupported provider");
}
