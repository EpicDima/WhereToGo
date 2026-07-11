# Where To Go — Куда пойти?

Web-приложение для случайного выбора места на карте города.

## Что делает приложение

1. Показывает интерактивную карту города (MapLibre GL JS + Carto Voyager тайлы)
2. Позволяет выбрать зону (полигон) — из пресетов или нарисовать свою
3. Пользователь(и) ставят позицию на карте кликом (поддержка нескольких друзей, drag)
4. Настраиваются мин/макс расстояния от участников
5. Генерирует случайную точку в зоне с учётом ограничений (haversine)
6. Опционально: показывает пешеходный маршрут (Valhalla API)
7. Ссылки на Google Maps / Яндекс Карты для навигации
8. Сохраняет настройки в localStorage

## Стек технологий

- **Frontend**: Svelte 5 + Vite 8
- **Карта**: MapLibre GL JS + Carto Voyager (бесплатно, без API ключа)
- **Гео-утилиты**: @turf/turf (point-in-polygon, haversine, random points)
- **Стили**: Tailwind CSS v4 (@theme)
- **Роутинг**: Valhalla public API (valhalla1.openstreetmap.de)
- **Персистенция**: localStorage
- **Backend**: нет, чисто клиентское приложение

## Дизайн

- Стиль Felt Maps / Citymapper: карта на весь экран, floating glass panels
- Один яркий акцент: coral #E8584A
- Monochrome chrome, backdrop-blur panels
- Шрифты: Inter (body), Plus Jakarta Sans (headings)
- Mobile: bottom sheet, desktop: floating sidebar слева

## Команды

```bash
npm run dev      # dev server (localhost:5173)
npm run build    # production build
npm run preview  # preview production build
```

## Структура проекта

```
src/
├── App.svelte                    # корень — MapView + Sidebar
├── app.css                       # Tailwind @theme, global styles, glass class
├── main.js                       # точка входа
├── lib/
│   ├── components/
│   │   ├── MapView.svelte        # карта, маркеры, зона, drawing, маршрут
│   │   ├── Sidebar.svelte        # floating panel с табами, генерация
│   │   ├── ZoneTab.svelte        # выбор зоны (пресеты + рисование)
│   │   ├── PeopleTab.svelte      # добавление участников
│   │   └── GenerateTab.svelte    # слайдеры расстояний, кнопка, результат
│   ├── stores/
│   │   └── app.svelte.js         # глобальное состояние (Svelte 5 $state), localStorage
│   └── utils/
│       ├── geo.js                # haversine, point-in-polygon, random point generation
│       ├── presets.js            # пресеты городов (Минск, Москва, СПб)
│       └── routing.js            # Valhalla API, polyline decode, format helpers
```

## Пресеты городов

- **Минск** (по умолчанию): центр (2-е кольцо), весь город (МКАД)
- **Москва**: центр (Садовое), внутри МКАД
- **Санкт-Петербург**: центр (Невский), весь город
