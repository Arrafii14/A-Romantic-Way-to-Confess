// /api/bot.js
const JSONBIN_API = "https://api.jsonbin.io/v3/b/68f4b509ae596e708f1c658a";
const JSONBIN_KEY = "$2a$10$78gA9G1LEzCRH4U2PwJqeXB/Cp8jXqh2wRWUV/tyKy9g7FzhFRm6";

const TOKEN = "8346279666:AAGYCj_7F64omKnkc_3IccstBVTewxJBwDc";
const CHAT_ID = "625857115";

export default async function handler(req, res) {
  try {
    // ---------- POST from web (Ilaaa's answer) ----------
    if (req.method === "POST" && !req.url.includes("?webhook=1")) {
      const { status, timestamp, userAgent } = req.body || {};
      const data = { answered: true, status, timestamp, userAgent, reset: false };

      await fetch(JSONBIN_API, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_KEY,
        },
        body: JSON.stringify(data),
      });

      const message = `🪐 Ilaaa udah menjawab!
💫 Status: ${status === "accept" ? "💚 DITERIMA" : "😭 DITOLAK"}
📅 ${timestamp}
📱 ${String(userAgent || "").slice(0, 50)}...`;

      await sendMsg(message);
      return res.status(200).json({ ok: true, message: "sent to telegram" });
    }

    // ---------- GET from web (read status) ----------
    if (req.method === "GET") {
      const r = await fetch(JSONBIN_API, {
        headers: { "X-Master-Key": JSONBIN_KEY },
      });
      const d = await r.json();
      // default safe payload if bin empty
      return res.status(200).json(d?.record || { answered: false, reset: false });
    }

    // ---------- PUT from web (clear or set flags) ----------
    if (req.method === "PUT") {
      const payload = req.body || {};
      // merge into existing record to avoid losing fields
      const cur = await (await fetch(JSONBIN_API, { headers: { "X-Master-Key": JSONBIN_KEY } })).json();
      const merged = { ...(cur?.record || {}), ...payload };

      await fetch(JSONBIN_API, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_KEY,
        },
        body: JSON.stringify(merged),
      });

      return res.status(200).json({ ok: true, record: merged });
    }

    // ---------- Telegram webhook (/reset, /status, /ping) ----------
    if (req.method === "POST" && req.url.includes("?webhook=1")) {
      const body = req.body;
      if (!body?.message?.text) return res.status(200).end();

      const text = body.message.text.trim().toLowerCase();

      if (text === "/reset") {
        const reset = { answered: false, reset: true, timestamp: new Date().toLocaleString() };
        await fetch(JSONBIN_API, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key": JSONBIN_KEY,
          },
          body: JSON.stringify({ ...(await getRecord()), ...reset }),
        });
        await sendMsg("🔁 Status Ilaaa udah direset oleh semesta 🌠");
      }

      if (text === "/status") {
        const record = await getRecord();
        let reply = "📊 *Status Saat Ini*\n";
        if (!record?.answered) {
          reply += "Belum ada jawaban dari Ilaaa 🌙";
        } else {
          reply += `💬 Status: ${record.status === "accept" ? "💚 DITERIMA" : "😭 DITOLAK"}
🕒 ${record.timestamp || "-"}
📱 ${String(record.userAgent || "-").slice(0, 50)}`;
        }
        await sendMsg(reply, true);
      }

      if (text === "/ping") {
        await sendMsg("🛰 Webhook aktif dan siap menerima sinyal 🌌");
      }

      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ ok: false, error: err.message });
  }

  async function sendMsg(text, markdown = false) {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: markdown ? "Markdown" : undefined,
      }),
    });
  }

  async function getRecord() {
    const r = await fetch(JSONBIN_API, { headers: { "X-Master-Key": JSONBIN_KEY } });
    const d = await r.json();
    return d?.record || { answered: false, reset: false };
  }
}
