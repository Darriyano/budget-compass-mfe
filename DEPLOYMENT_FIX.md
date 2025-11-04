# Исправление проблемы с деплоем на стенд

## Проблема
После деплоя на https://ift-1.brojs.ru/TravelForge ничего не отображается.

## Решение

### 1. Настройка переменных окружения

Создайте или обновите файл `.env` в папке `backend/` со следующими переменными:

```env
# Server configuration
PORT=5000
NODE_ENV=production

# Base path - КРИТИЧЕСКИ ВАЖНО для правильной работы!
BASE_PATH=/TravelForge

# JWT Secret
JWT_SECRET=your-production-jwt-secret

# CORS - добавьте URL вашего фронтенда
ALLOWED_ORIGINS=https://ift-1.brojs.ru

# GIGACHAT
GIGACHAT_CLIENT_ID=your-gigachat-client-id
GIGACHAT_SECRET=your-gigachat-secret
```

### 2. Настройка фронтенда для сборки

Перед сборкой фронтенда создайте файл `.env` в папке `frontend/`:

```env
# Base path для React Router
REACT_APP_BASE_PATH=/TravelForge

# URL бэкенда (замените на ваш реальный URL)
REACT_APP_API_URL=https://ift-1.brojs.ru/api
```

### 3. Порядок сборки и деплоя

1. **Соберите фронтенд:**
   ```bash
   cd frontend
   npm install
   REACT_APP_BASE_PATH=/TravelForge REACT_APP_API_URL=https://ift-1.brojs.ru/api npm run build
   ```

2. **Соберите бэкенд:**
   ```bash
   cd backend
   npm install
   npm run build
   ```

3. **Убедитесь, что структура папок правильная:**
   ```
   backend/
     dist/          # скомпилированный бэкенд
   frontend/
     build/         # скомпилированный фронтенд
   ```

4. **Деплой** - в зависимости от вашей платформы деплоя (brojs admin)

### 4. Проверка после деплоя

После деплоя проверьте:

1. **Health check бэкенда:**
   ```
   https://ift-1.brojs.ru/health
   ```
   Должен вернуть JSON с `success: true`

2. **Доступ к фронтенду:**
   ```
   https://ift-1.brojs.ru/TravelForge
   ```
   Должен показать React приложение

3. **Проверка консоли браузера:**
   - Откройте DevTools (F12)
   - Проверьте вкладку Console на наличие ошибок
   - Проверьте вкладку Network на наличие 404 ошибок

### 5. Возможные проблемы и решения

#### Проблема: Белый экран
- **Решение:** Проверьте, что `REACT_APP_BASE_PATH` установлен правильно
- Проверьте, что бэкенд раздает статические файлы из `frontend/build`

#### Проблема: 404 на статические файлы (JS, CSS)
- **Решение:** Убедитесь, что `BASE_PATH=/TravelForge` установлен в бэкенде
- Проверьте, что фронтенд собран с правильным `PUBLIC_URL` (если используется)

#### Проблема: API запросы не работают
- **Решение:** Проверьте `REACT_APP_API_URL` в `.env` фронтенда
- Убедитесь, что CORS настроен правильно (`ALLOWED_ORIGINS`)

#### Проблема: Роутинг не работает (404 на /results и т.д.)
- **Решение:** Убедитесь, что fallback на `index.html` настроен в сервере
- Проверьте, что `REACT_APP_BASE_PATH` установлен в фронтенде

### 6. Важные изменения в коде

1. **Бэкенд (`backend/src/server.ts`):**
   - Добавлена раздача статических файлов из `frontend/build`
   - Настроен fallback на `index.html` для SPA routing
   - Поддержка `BASE_PATH` для деплоя в подпапке

2. **Фронтенд (`frontend/src/index.tsx`):**
   - Добавлен `basename` в `BrowserRouter` для поддержки подпапки
   - Использует `REACT_APP_BASE_PATH` из переменных окружения

3. **API Service (`frontend/src/services/api.ts`):**
   - Использует `REACT_APP_API_URL` вместо hardcoded localhost

### 7. Проверка логов

После деплоя проверьте логи сервера на наличие:
- Предупреждений о отсутствии папки `frontend/build`
- Ошибок при раздаче статических файлов
- CORS ошибок

