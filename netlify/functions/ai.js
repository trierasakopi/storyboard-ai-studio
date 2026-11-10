const AIPORT_BASE = 'https://aiport.id';
const headers = (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' });
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };
  const key = process.env.AIPORT_API_KEY;
  if (!key) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'API Key belum dipasang. Tambahkan AIPORT_API_KEY pada Netlify environment variables.' }) };
  try {
    const body = JSON.parse(event.body || '{}');
    const action = body.action;
    let system = 'Kamu adalah creative director, penulis storyboard, dan sutradara sinematografi. Jawab dalam Bahasa Indonesia. Ikuti format output yang diminta secara ketat.';
    let user = '';
    if (action === 'ideas') {
      user = `Buat ${Math.min(20, Math.max(1, Number(body.count) || 10))} ide konten untuk kategori: ${body.category || 'umum'}. Platform: ${body.platform || 'video sosial'}. Topik: ${body.topic || 'bebas, pilih yang menarik'}. Gaya: ${body.style || 'realistis cinematic'}.\nSetiap ide harus punya judul kuat, konsep visual spesifik, dan hook pembuka. Hindari ide generik dan variasi yang berulang.\nKembalikan HANYA JSON valid dengan bentuk: {"ideas":[{"title":"...","concept":"...","hook":"..."}]}`;
    } else if (action === 'storyboard') {
      user = `Kembangkan ide menjadi storyboard produksi. Judul: ${body.title || ''}. Konsep: ${body.concept || ''}. Jumlah scene: ${Math.min(12, Math.max(2, Number(body.scenes) || 4))}. Durasi tiap scene: ${body.duration || '10 detik'}. Rasio: ${body.ratio || '9:16'}. Gaya visual: ${body.style || 'Photorealistic cinematic'}. Konsistensi wajib: ${body.continuity || 'Jaga semua karakter dan objek tetap konsisten'}. Audio: ${body.audio || 'ASMR'}.\nBuat alur logis dari pembuka sampai penutup. Setiap scene harus menyambung secara ruang, waktu, karakter, properti, dan progres aksi. Jangan mengubah desain karakter/objek. Deskripsikan visual yang dapat benar-benar divisualisasikan, bukan abstrak.\nUntuk setiap scene isi: name, duration, action, visual_prompt (prompt gambar detail dalam bahasa Inggris agar cocok untuk image model), camera (shot size, angle, lens feel, camera movement), video_prompt (prompt gerak video bahasa Inggris; gerakan subjek dan kamera, awal-akhir aksi), audio (detail suara). Tambahkan negative_prompt yang mencegah perubahan identitas, teks acak, watermark, anatomi rusak, objek tambahan yang tidak diminta.\nKembalikan HANYA JSON valid: {"title":"...","logline":"...","global_style":"...","continuity":"...","scenes":[{"name":"...","duration":"...","action":"...","visual_prompt":"...","camera":"...","video_prompt":"...","audio":"...","negative_prompt":"..."}]}`;
    } else {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Aksi tidak dikenal.' }) };
    }
    const resp = await fetch(`${AIPORT_BASE}/v1/chat/completions`, {
      method: 'POST', headers: headers(key),
      body: JSON.stringify({ model: process.env.AIPORT_TEXT_MODEL || 'deepseek-v4-flash', temperature: 0.8, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] })
    });
    const raw = await resp.text();
    if (!resp.ok) return { statusCode: resp.status, headers: cors, body: JSON.stringify({ error: `AIport error (${resp.status}): ${raw.slice(0, 700)}` }) };
    const data = JSON.parse(raw);
    let content = data.choices?.[0]?.message?.content || '';
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    let parsed;
    try { parsed = JSON.parse(content); }
    catch { const start = content.indexOf('{'), end = content.lastIndexOf('}'); if (start >= 0 && end > start) parsed = JSON.parse(content.slice(start, end + 1)); else throw new Error('AI tidak mengembalikan JSON valid. Silakan coba lagi.'); }
    return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(action === 'ideas' ? parsed : { storyboard: parsed }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message || 'Terjadi kesalahan server.' }) };
  }
};
