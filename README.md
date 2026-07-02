# Baraholka.md

Next.js MVP простой локальной доски объявлений для Молдовы.

## Что уже есть

- главная страница объявлений;
- категории, поиск, фильтры по городу и цене;
- форма подачи объявления;
- сохранение тестовых объявлений в localStorage;
- страница отдельного объявления `/listings/[id]`;
- простая админка `/admin`;
- статусы: `На модерации`, `Активное`, `Отклонено`;
- заготовка под Supabase;
- структура готова для GitHub и Vercel.

## Локальный запуск

```bash
cd "C:\Users\Andrei Zavtur\OneDrive\Документы\New project\baraholka-md"
npm install
npm run dev
```

После запуска открыть: http://localhost:3000

## Supabase

1. Создать проект в Supabase.
2. Скопировать `.env.example` в `.env.local`.
3. Заполнить `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Выполнить SQL из `supabase/schema.sql`.

Пока MVP работает на localStorage. Supabase-подключение подготовлено для следующего этапа.

## GitHub

```bash
git init
git add .
git commit -m "Initial Baraholka.md MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/baraholka-md.git
git push -u origin main
```

## Vercel

1. Залить проект на GitHub.
2. В Vercel нажать `Add New Project`.
3. Выбрать репозиторий `baraholka-md`.
4. Framework Preset: Next.js.
5. Добавить переменные окружения из `.env.local`, когда подключим Supabase.
6. Нажать `Deploy`.
