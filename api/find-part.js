// api/find-part.js
// Serverless-функция для Vercel. Прячет YANDEX_API_KEY от браузера.
// Переменные окружения задаются в панели Vercel (Settings -> Environment Variables):
//   YANDEX_API_KEY  - API-ключ сервисного аккаунта
//   YANDEX_FOLDER_ID - идентификатор каталога Yandex Cloud

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST is allowed' });
  }

  const { system, query } = req.body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Field "query" is required' });
  }

  const apiKey = process.env.YANDEX_API_KEY;
  const folderId = process.env.YANDEX_FOLDER_ID;
  if (!apiKey || !folderId) {
    return res.status(500).json({ error: 'Server is not configured (missing env vars)' });
  }

  const payload = {
    modelUri: `gpt://${folderId}/yandexgpt/latest`,
    completionOptions: {
      stream: false,
      temperature: 0.2,
      maxTokens: 1000
    },
    messages: [
      { role: 'system', text: system || 'Ты полезный ассистент.' },
      { role: 'user', text: query }
    ]
  };

  try {
    const ygptRes = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!ygptRes.ok) {
      const errText = await ygptRes.text();
      return res.status(502).json({ error: 'YandexGPT error', details: errText });
    }

    const data = await ygptRes.json();
    const text = data?.result?.alternatives?.[0]?.message?.text || '';
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: 'Request failed', details: String(err) });
  }
}
