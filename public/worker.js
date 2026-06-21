// Isi file index.js Anda di GitHub
export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") return new Response("Hanya POST", { status: 405 });

    try {
      const requestData = await request.json();
      const userPrompt = requestData.prompt;

      // Memanggil API Google Gemini 3.5 Flash terbaru
      const GEMINI_API_KEY = env.GEMINI_KEY; 
      const googleUrl = `https://googleapis.com{GEMINI_API_KEY}`;

      const geminiResponse = await fetch(googleUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: userPrompt }] }] }),
      });

      const geminiData = await geminiResponse.json();

      if (geminiData.candidates && geminiData.candidates[0].content) {
        const aiResponseText = geminiData.candidates[0].content.parts[0].text;
        return new Response(JSON.stringify({ reply: aiResponseText }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
      return new Response(JSON.stringify({ reply: "Eror data format" }), { status: 400 });
    } catch (error) {
      return new Response(JSON.stringify({ reply: error.message }), { status: 500 });
    }
  },
};
