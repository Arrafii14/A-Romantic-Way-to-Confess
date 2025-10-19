import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    // Pastikan hanya POST yang diterima
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Ambil data dari body (status & waktu)
    const body = JSON.parse(req.body || "{}");
    const { status } = body;
    const timestamp = new Date().toISOString();

    // Path file JSON & log
    const dbPath = path.join(process.cwd(), "api", "db.json");
    const logPath = path.join(process.cwd(), "api", "log.txt");

    // Baca data lama
    let data = { answered: false, status: null, history: [] };
    if (fs.existsSync(dbPath)) {
      data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    }

    // Update data
    data.answered = true;
    data.status = status;
    data.history.push({ status, timestamp });

    // Simpan ke file
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    fs.appendFileSync(logPath, `${timestamp} - ${status}\n`);

    // Kirim respons
    return res.status(200).json({ message: "Saved successfully", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
