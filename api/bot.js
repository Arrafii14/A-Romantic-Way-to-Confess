// =======================
// 🔧 CONFIGURATION
// =======================

// ganti dengan Blob ID lo
const JSONBLOB_API = "https://jsonblob.com/api/jsonBlob/1429425578867613696";

// 🔹 TELEGRAM
const TOKEN = "8346279666:AAGYCj_7F64omKnkc_3IccstBVTewxJBwDc";
const CHAT_ID = "625857115";

// =======================
// 🚀 MAIN HANDLER
// =======================
export default async function handler(req, res) {
  try {
    // =========================================================
    // 1️⃣ POST dari browser Ilaaa (jawaban dikirim)
    // =========================================================
    if (req.method === "POST" && !req.url.includes("?webhook=1")) {
      const { status, timestamp, userAgent } = req.body;
      const data = {
        answered: true,
        reset: false,
        status,
        timestamp,
        userAgent,
      };

      // update blob
      await fetch(JSONBLOB_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // kirim notif ke Telegram
      const message = `🪐 Ilaaa udah menjawab!\n💫 Status: ${
        status === "accept" ? "💚 DITERIMA" : "😭 DITOLAK"
      }\n📅 ${timestamp}\n📱 ${userAgent.slice(0, 50)}...`;
      await sendMsg(message);

      return res.status(200).json({ ok: true, message: "sent to telegram" });
    }

    // =========================================================
    // 2️⃣ GET dari web (cek status terakhir)
    // =========================================================
    if (req.method === "GET") {
      const r = await fetch(JSONBLOB_API, { cache: "no-store" });
      if (!r.ok) throw new Error("JSONBlob fetch failed");
      const record = await r.json();

      const normalized = {
        answered: record?.answered === true,
        reset: record?.reset === true,
        status: record?.status || null,
        timestamp: record?.timestamp || null,
      };

      return res.status(200).json(normalized);
    }

    // =========================================================
    // 3️⃣ Webhook Telegram (/reset, /status, /ping)
    // =========================================================
    if (req.method === "POST" && req.url.includes("?webhook=1")) {
      const body = req.body;
      if (!body.message || !body.message.text) return res.status(200).end();

      const text = body.message.text.trim().toLowerCase();

      // 🧹 /reset
      if (text === "/reset") {
        const reset = {
          answered: false,
          reset: true,
          status: null,
          timestamp: new Date().toLocaleString(),
        };

        await fetch(JSONBLOB_API, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reset),
        });

        await sendMsg("🔁 Status Ilaaa udah direset oleh semesta 🌠");
      }

      // 📊 /status
      if (text === "/status") {
        const r = await fetch(JSONBLOB_API, { cache: "no-store" });
        const record = await r.json();

        let reply = "📊 *Status Saat Ini*\n";
        if (!record.answered) {
          reply += "Belum ada jawaban dari Ilaaa 🌙";
        } else {
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

    // =========================================================
    // ❌ selain itu
    // =========================================================
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ ok: false, error: err.message });
  }

  // =========================================================
  // 🧩 Helper kirim Telegram
  // =========================================================
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
