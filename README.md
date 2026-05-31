# SummerFlow 🌴

Мобильное веб-приложение для летних активностей, челленджей и сборов компании.

## Стек

- **Next.js 15** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS 4**
- **Lucide React** — иконки
- **Firebase** — аналитика

## Запуск

```bash
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000) в браузере (лучше в мобильном режиме DevTools).

## Структура

```
src/
├── app/
│   ├── globals.css      # Tailwind + кастомные анимации
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Главная страница
├── components/
│   └── SummerFlowDashboard.tsx  # MVP дашборд
└── lib/
    └── firebase.ts      # Firebase конфигурация
```

## Функции MVP

- AI-генератор активностей («Мне скучно!»)
- Переключатель Соло / С друзьями
- Горизонтальные карточки летних челленджей
- Лента сборов и встреч с join-логикой
- FAB + модалка «Объявить сбор»
- Нижняя навигация
