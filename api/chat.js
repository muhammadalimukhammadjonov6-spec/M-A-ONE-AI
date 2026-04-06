export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Faqat POST" });
  try {
    const { messages, model } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "messages kerak" });
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return res.status(500).json({ error: "Server sozlanmagan." });
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: model || "llama-3.3-70b-versatile", messages, max_tokens: 4096, temperature: 0.7 }),
    });
    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return res.status(groqRes.status).json({ error: err?.error?.message || "Groq xatosi" });
    }
    const data = await groqRes.json();
    return res.status(200).json({ response: data?.choices?.[0]?.message?.content || "Javob olinmadi" });
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi: " + e.message });
  }
}
