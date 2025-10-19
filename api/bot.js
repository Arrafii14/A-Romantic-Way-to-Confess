export default async function handler(req, res) {
  const TELEGRAM_TOKEN = '8346279666:AAGYCj_7F64omKnkc_3IccstBVTewxJBwDc';
  const CHAT_ID = '625857115';
  const API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

  // simpan flag reset sementara
  if (!globalThis.resetFlag) globalThis.resetFlag = false;

  try {
    if (req.method === 'POST') {
      const body = req.body;

      // kalau pesan /reset dari lo
      if (body?.message?.text?.trim() === '/reset' && body?.message?.chat?.id == CHAT_ID) {
        globalThis.resetFlag = true;

        await fetch(`${API_URL}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: '🔄 Reset signal sent! Ilaaa\'s page will restart soon 🌙',
          })
        });

        return res.status(200).json({ ok: true });
      }

      // kalau Ilaaa klik tombol
      if (body?.status) {
        const msg = `
🪐 *Laaa sudah menjawab!*
💫 Status: ${body.status === 'accept' ? '💚 Terima' : '😭 Tolak'}
⏰ Waktu: ${new Date().toLocaleString()}
🌐 Device: ${body.userAgent || 'unknown'}
`;

        await fetch(`${API_URL}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: 'Markdown'
          })
        });

        return res.status(200).json({ ok: true });
      }

      return res.status(200).json({ ok: true });
    }

    // frontend Ilaaa ngecek reset status
    if (req.method === 'GET') {
      const shouldReset = globalThis.resetFlag || false;
      globalThis.resetFlag = false;
      return res.status(200).json({ reset: shouldReset });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
}
