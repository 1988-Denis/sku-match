# SKU-MATCH — деплой на Vercel

Готовый проект: статический виджет (`index.html`) + серверная функция-прокси
(`api/find-part.js`), которая прячет ваш YandexGPT-ключ от браузера.

## Что нужно заранее
1. Аккаунт на vercel.com (бесплатно, можно войти через GitHub)
2. Аккаунт в Yandex Cloud с:
   - `FOLDER_ID` — идентификатор каталога
   - `API_KEY` — API-ключ сервисного аккаунта с ролью `ai.languageModels.user`

## Деплой (3 способа, от простого к гибкому)

### Способ А — без консоли, через сайт Vercel
1. Зайдите на vercel.com → "Add New" → "Project"
2. Загрузите эту папку (или залейте её на GitHub и импортируйте репозиторий)
3. В настройках проекта → Settings → Environment Variables добавьте:
   - `YANDEX_API_KEY` = ваш ключ
   - `YANDEX_FOLDER_ID` = ваш folder id
4. Нажмите Deploy — через минуту получите ссылку вида `your-project.vercel.app`

### Способ Б — через терминал (быстрее для повторных деплоев)
```bash
npm install -g vercel
cd vercel_project
vercel login
vercel
# на вопросы отвечайте Enter (значения по умолчанию)
vercel env add YANDEX_API_KEY
vercel env add YANDEX_FOLDER_ID
vercel --prod
```

### Способ В — подключить свой домен
После первого деплоя: Vercel Dashboard → ваш проект → Settings → Domains →
добавьте `ваш-магазин.рф` (домен покупается отдельно на reg.ru/timeweb).
Vercel сам выпустит SSL-сертификат.

## Проверка перед тем как печатать QR
1. Откройте полученную ссылку в браузере
2. Введите тестовый запрос вроде "Karcher K3, крутится но не дует"
3. Убедитесь, что ответ приходит и совпадения релевантны
4. Только после этого генерируйте финальный QR на постоянный URL

## Дальнейшие правки
- Промпт и логика подбора — внутри `index.html`, переменная `systemPrompt`
- Модель — в `api/find-part.js`, строка `modelUri` (можно заменить на
  `yandexgpt-lite/latest` для более дешёвых запросов)
