# Budget Compass Backend

Backend API для приложения "Бюджетный компас" - планировщика поездок.

## Технологии

- Node.js
- Express.js
- TypeScript
- Nodemon (для разработки)

## Установка

```bash
npm install
```

## Запуск

### Режим разработки

```bash
npm run dev
```

### Продакшн

```bash
npm run build
npm start
```

## API Эндпоинты

### Города

- `GET /api/cities` - получить все города
- `GET /api/cities/search` - поиск городов по параметрам
- `GET /api/cities/:id` - получить город по ID

### Поездки

- `GET /api/trips` - получить все сохраненные поездки
- `GET /api/trips/:id` - получить поездку по ID
- `POST /api/trips` - сохранить новую поездку
- `DELETE /api/trips/:id` - удалить поездку

### Валюты

- `GET /api/currencies/rates` - получить курсы валют
- `GET /api/currencies/convert` - конвертировать валюту

### TravelBot

- `POST /api/travelbot/ask` - задать вопрос TravelBot

### Health Check

- `GET /health` - проверка состояния сервера

## Примеры запросов

### Поиск городов

```
GET /api/cities/search?budget=1000&startDate=2024-01-01&endDate=2024-01-07&prefCulture=70&prefNature=30&prefParty=50
```

### Сохранение поездки

```
POST /api/trips
Content-Type: application/json

{
  "cityId": "lisbon",
  "params": {
    "budget": 1000,
    "startDate": "2024-01-01",
    "endDate": "2024-01-07",
    "origin": "Москва",
    "prefCulture": 70,
    "prefNature": 30,
    "prefParty": 50
  },
  "adjustedBudget": {
    "flights": 40,
    "lodging": 30,
    "food": 15,
    "local": 10,
    "buffer": 5
  },
  "total": 1000
}
```

### Конвертация валют

```
GET /api/currencies/convert?amount=100&from=USD&to=EUR
```

### Вопрос TravelBot

```
POST /api/travelbot/ask
Content-Type: application/json

{
  "question": "Где попробовать местную кухню?"
}
```
