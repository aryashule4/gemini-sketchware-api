import { GoogleGenAI } from '@google/genai';

export default {
  async fetch(request, env) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Content-Type': 'text/plain; charset=utf-8'
    };

    if (request.method !== 'POST') {
      return new Response('Kirim permintaan dengan metode POST.', { status: 400, headers });
    }

    try {
      const promptText = await request.text();
      
      if (!promptText || promptText.trim() === '') {
        return new Response('Pertanyaan tidak boleh kosong.', { status: 400, headers });
      }

      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: promptText,
      });

      return new Response(response.text, { status: 200, headers });
    } catch (error) {
      return new Response('Terjadi kesalahan server: ' + error.message, { status: 500, headers });
    }
  }
};

