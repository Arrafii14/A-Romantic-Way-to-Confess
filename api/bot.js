// =======================
// 🔧 CONFIGURATION
// =======================

// 🔹 GANTI 2 BARIS INI SESUAI JSONBIN LO
const JSONBIN_API = "https://api.jsonbin.io/v3/b/68f4b509ae596e708f1c658a"; // ganti dengan Bin lo
const JSONBIN_KEY = "$2a$10$78gA9G1LEzCRH4U2PwJqeXB/Cp8jXqh2wRWUV/tyKy9g7FzhFRm6"; // ganti dengan X-MASTER-KEY lo

// 🔹 TELEGRAM
const TOKEN = "8346279666:AAGYCj_7F64omKnkc_3IccstBVTewxJBwDc";
const CHAT_ID = "625857115";

// =======================
// 🚀 MAIN HANDLER
// =======================
export default async function handler(req, res) {
  try {
    // 1️⃣ POST dari browser Ilaaa (jawaban)
    if (req.method === "POST" && !req.url.includes("?webhook=1")) {
      const { status, timestamp, userAgent } = req.body;
      const data = { answered: true, status, timestamp, userAgent };

      await fetch(JSONBIN_API, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_KEY,
        },
        body: JSON.stringify(data),
      });

      const message = `🪐 Ilaaa udah menjawab!\n💫 Status: ${
        status === "accept" ? "💚 DITERIMA" : "😭 DITOLAK"
      }\n📅 ${timestamp}\n📱 ${userAgent.slice(0, 50)}...`;

      await sendMsg(message);
      return res.status(200).json({ ok: true, message: "sent to telegram" });
    }

    // 2️⃣ GET dari web (buat check status di browser)
    if (req.method === "GET") {
      const r = await fetch(JSONBIN_API, {
        headers: { "X-Master-Key": JSONBIN_KEY },
      });
      const d = await r.json();
      return res.status(200).json(d.record);
    }

    // 3️⃣ Webhook Telegram (/reset, /status, /ping)
    if (req.method === "POST" && req.url.includes("?webhook=1")) {
      const body = req.body;
      if (!body.message || !body.message.text) return res.status(200).end();

      const text = body.message.text.trim().toLowerCase();

      // 🧹 /reset
      if (text === "/reset") {
        const reset = { answered: false };
        await fetch(JSONBIN_API, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key": JSONBIN_KEY,
          },
          body: JSON.stringify(reset),
        });

        await sendMsg("🔁 Status Ilaaa udah direset oleh semesta 🌠");
      }

      // 📊 /status
      if (text === "/status") {
        const r = await fetch(JSONBIN_API, {
          headers: { "X-Master-Key": JSONBIN_KEY },
        });
        const d = await r.json();
        const record = d.record || {};

        let reply = "📊 *Status Saat Ini*\n";
        if (!record.answered) reply += "Belum ada jawaban dari Ilaaa 🌙";
        else {
          reply += `💬 Status: ${
            record.status === "accept" ? "💚 DITERIMA" : "😭 DITOLAK"
          }\n🕒 ${record.timestamp}\n📱 ${
            record.userAgent?.slice(0, 50) || "-"
          }`;
        }

        await sendMsg(reply, true);
      }

      // 🛰 /ping
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

  // helper: kirim message ke Telegram
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
}
