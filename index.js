export default {
  async fetch(request, env) {
    // Mengizinkan koneksi dari aplikasi Android (CORS)
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Menangani preflight request dari sistem Android
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    // Memproses request yang masuk ke folder /api/
    if (url.pathname.startsWith("/api/") && request.method === "POST") {
      try {
        // 1. Ambil data teks prompt dari Sketchware
        const body = await request.json();
        const userPrompt = body.prompt;

        if (!userPrompt) {
          return new Response(JSON.stringify({ reply: "Pertanyaan kosong!" }), { status: 400, headers });
        }

        // 2. Ambil Gemini API Key rahasia yang sudah Anda simpan di Dashboard Cloudflare
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
          return new Response(JSON.stringify({ reply: "Sistem Error: API Key belum diatur di Cloudflare!" }), { status: 500, headers });
        }

        // 3. Lakukan request ke endpoint resmi Google Gemini API (Model terbaru 2026: gemini-2.5-flash)
        const geminiUrl = `https://googleapis.com{apiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }]
          })
        });

        const geminiData = await geminiResponse.json();

        // 4. Ambil teks jawaban hasil generasi Gemini
        if (geminiData.candidates && geminiData.candidates[0].content.parts[0].text) {
          const aiReply = geminiData.candidates[0].content.parts[0].text;
          
          // Kirimkan balik ke aplikasi Sketchware dalam format JSON {"reply": "..."}
          return new Response(JSON.stringify({ reply: aiReply }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ reply: "Gemini gagal memberikan jawaban. Periksa kuota API Anda." }), { status: 500, headers });
        }

      } catch (error) {
        return new Response(JSON.stringify({ reply: "Terjadi kesalahan sistem: " + error.message }), { status: 500, headers });
      }
    }

    // Jika diakses lewat browser biasa tanpa rute /api/
    return new Response(JSON.stringify({ message: "Arya AI Server sedang berjalan aktif!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};

