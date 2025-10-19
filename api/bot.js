export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true, message: "Bot API aktif 🚀" });
  }

  try {
    const TELEGRAM_TOKEN = "8346279666:AAGYCj_7F64omKnkc_3IccstBVTewxJBwDc";
    const CHAT_ID = "625857115";

    const body = await req.json();
    console.log("Body diterima:", body);

    // Reset via Telegram
    if (body.message?.text === "/reset") {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: "🔄 Reset signal sent! Ilaaa's page will restart soon 🌙",
        }),
      });
      return res.status(200).json({ ok: true, reset: true });
    }

    // Kirim hasil dari website (accept/reject)
    if (body.status) {
      const message = `🪐 Laaa sudah menjawab!\n💫 Status: ${
        body.status === "accept" ? "💚 Terima" : "😭 Tolak"
      }\n⏰ ${new Date().toLocaleString("id-ID")}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
        }),
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
