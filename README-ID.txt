STORYBOARD AI STUDIO - BUILD 0.1

ISI PAKET
- index.html: antarmuka aplikasi responsif
- netlify/functions/ai.js: backend aman untuk AIport text generation
- netlify.toml: konfigurasi deploy Netlify

FITUR YANG SUDAH AKTIF PADA BUILD 0.1
1. Dashboard
2. Generator ide konten AI melalui AIport
3. Generator storyboard scene-by-scene melalui AIport
4. Simpan proyek di browser (localStorage)
5. Buka dan hapus proyek
6. Ekspor storyboard ke TXT

CARA DEPLOY
1. Ekstrak ZIP ini.
2. Upload folder proyek ke GitHub, atau deploy folder melalui Netlify.
   Untuk Netlify Drop, deploy folder hasil ekstrak yang berisi index.html dan netlify.toml.
   Jika Netlify Drop tidak memproses Functions pada metode deploy tersebut, hubungkan repository GitHub ke Netlify agar fungsi server ikut dibangun.
3. Di Netlify: Site configuration > Environment variables.
4. Tambahkan variable:
   Key: AIPORT_API_KEY
   Value: API key AIport milik Anda
5. (Opsional) Tambahkan:
   Key: AIPORT_TEXT_MODEL
   Value: deepseek-v4-flash
6. Trigger deploy ulang / Deploys > Trigger deploy.
7. Buka website dan coba menu Generate Ide.

KEAMANAN
- Jangan masukkan API Key ke index.html.
- Jangan kirim API Key melalui chat.
- Simpan key hanya pada Environment Variables Netlify.
- Jika key pernah terlanjur dipublikasikan, cabut dan buat key baru.

CATATAN TAHAP
Build 0.1 mengaktifkan ide dan storyboard berbasis teks. Image generation dan video generation belum diaktifkan pada build ini; keduanya akan dibuat pada tahap berikutnya dengan job polling dan biaya yang ditampilkan sebelum generate.
