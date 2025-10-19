import fs from "fs";
import path from "path";

const TOKEN = "8346279666:AAGYCj_7F64omKnkc_3IccstBVTewxJBwDc";
const CHAT_ID = "625857115";
const FLAG_PATH = "/tmp/flag.json"; // Vercel temporary storage

export default async function handler(req, res) {
  // 1️⃣ POST dari browser → simpan & kirim Telegram
  if (req.method === "POST") {
    try {
      const { status, timestamp, userAgent } = req.body;
      const data = { answered: true, status, timestamp, userAgent };
      fs.writeFileSync(FLAG_PATH, JSON.stringify(data));

      const message = `🪐 Ilaaa udah menjawab!\n💫 Status: ${
        status === "accept" ? "💚 DITERIMA" : "😭 DITOLAK"
      }\n📅 ${timestamp}\n📱 ${userAgent.slice(0, 40)}...`;

      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
      });

      return res.status(200).json({ ok: true, message: "Sent to Telegram" });
    } catch (err) {
      console.error("Error POST:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // 2️⃣ GET dari client → baca flag
  if (req.method === "GET") {
    try {
      if (!fs.existsSync(FLAG_PATH))
        fs.writeFileSync(FLAG_PATH, JSON.stringify({ answered: false }));

      const flag = JSON.parse(fs.readFileSync(FLAG_PATH, "utf-8"));
      return res.status(200).json(flag);
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // 3️⃣ Webhook Telegram untuk reset via command "/reset"
  if (req.method === "POST" && req.url.includes(`?webhook=1`)) {
    const body = req.body;
    if (!body.message || !body.message.text) return res.status(200).end();

    const text = body.message.text.trim();
    if (text === "/reset") {
      fs.writeFileSync(FLAG_PATH, JSON.stringify({ answered: false }));
      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: "🔁 Status Ilaaa direset oleh semesta 🌠" }),
      });
    }

    return res.status(200).json({ ok: true });
  }

  // fallback
  res.status(405).json({ error: "Method not allowed" });
}
