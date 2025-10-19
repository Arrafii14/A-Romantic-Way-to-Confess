// =======================
// 🔧 CONFIGURATION
// =======================

// 🔹 GANTI 2 BARIS INI SESUAI JSONBIN LO
const JSONBIN_API = "https://api.jsonbin.io/v3/b/68f4b509ae596e708f1c658a";
const JSONBIN_KEY = "$2a$10$78gA9G1LEzCRH4U2PwJqeXB/Cp8jXqh2wRWUV/tyKy9g7FzhFRm6";

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

      // update ke JSONBin
      await fetch(`${JSONBIN_API}/latest`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_KEY,
        },
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
    // 2️⃣ GET dari web (buat check status terakhir di browser)
    // =========================================================
    if (req.method === "GET") {
      const r = await fetch(`${JSONBIN_API}/latest?meta=false`, {
        headers: { "X-Master-Key": JSONBIN_KEY },
      });

      if (!r.ok) throw new Error("JSONBin fetch failed");
      const record = await r.json();

      // normalisasi data agar frontend gak error
      const normalized = {
        answered: record.answered === true,
        reset: record.reset === true,
        status: record.status || null,
        timestamp: record.timestamp || null,
      };

      return res.status(200).json(normalized);
    }

    // =========================================================
    // 3️⃣ Webhook Telegram (/reset, /status, /ping)
    // =========================================================
    if (req.method === "POST" && req.url.includes("?webhook=1")) {
      const body = req.body;
      if (!body.message || !body.message.text)
        return res.status(200).end();

      const text = body.message.text.trim().toLowerCase();

      // 🧹 /reset — buat ngereset ke awal
      if (text === "/reset") {
        const reset = {
          answered: false,
          reset: true,
          status: null,
          timestamp: new Date().toLocaleString(),
        };

        await fetch(`${JSONBIN_API}/latest`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key": JSONBIN_KEY,
          },
          body: JSON.stringify(reset),
        });

        await sendMsg("🔁 Status Ilaaa udah direset oleh semesta 🌠");
      }

      // 📊 /status — buat ngecek kondisi terakhir
      if (text === "/status") {
        const r = await fetch(`${JSONBIN_API}/latest?meta=false`, {
          headers: { "X-Master-Key": JSONBIN_KEY },
        });
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

      // 🛰 /ping — tes webhook
      if (text === "/ping") {
        await sendMsg("🛰 Webhook aktif dan siap menerima sinyal 🌌");
      }

      return res.status(200).json({ ok: true });
    }

    // =========================================================
    // ❌ kalau method lain
    // =========================================================
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ ok: false, error: err.message });
  }

  // =========================================================
  // 🧩 Helper: Kirim pesan ke Telegram
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
