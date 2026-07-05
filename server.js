// server.js
// Единый сервер: отдаёт index.html и обрабатывает POST /api/find-part.
// Подходит для Timeweb Cloud App Platform (тип приложения — Node.js/Express).

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname)));

app.post('/api/find-part', async (req, res) => {
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
    completionOptions: { stream: false, temperature: 0.2, maxTokens: 1000 },
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
});

app.listen(PORT, () => {
  console.log(`SKU-MATCH server running on port ${PORT}`);
});
