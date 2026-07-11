# Where To Go — Куда пойти?

Web-приложение для случайного выбора места на карте города.

## Что делает приложение

1. Карта на весь экран (MapLibre GL JS + Carto тайлы, светлая/тёмная)
2. Пошаговый wizard: Зона → Люди → Настройки → Результат
3. Зоны из пресетов (Минск МКАД / центр) или рисование своей
4. Несколько участников с drag-маркерами + GPS + сохранение
5. Мин/макс расстояние с визуализацией кругов на карте
6. Генерация случайной точки (haversine) + перегенерация без рестарта
7. Пешеходный маршрут на карте (Valhalla API)
8. Per-friend навигация: Google Maps / Яндекс с origin→destination
9. Тёмная тема, localStorage, 2D-only карта

## Стек

- **Svelte 5** + Vite 8 (порт 4269)
- **MapLibre GL JS** + Carto Voyager / Dark Matter
- **@turf/turf** (geo-утилиты)
- **Tailwind CSS v4** (@theme)
- **Valhalla** public API (маршруты)
- Без бэкенда

## Дизайн

- Floating glass panel поверх full-bleed карты (backdrop-blur)
- Акцент: coral #E8584A
- Круги расстояний: indigo #6366F1 (мин), amber #F59E0B (макс)
- Dark mode: Carto Dark Matter + тёмные CSS variables
- Шрифты: Inter + Plus Jakarta Sans

## Команды

```bash
npm run dev      # localhost:4269
npm run build    # production
npm run preview  # preview build
```

## Структура

```
src/
├── App.svelte
├── app.css                      # Tailwind @theme, dark mode vars, glass
├── main.js
├── lib/
│   ├── components/
│   │   ├── MapView.svelte       # карта, маркеры, зоны, маршрут, радиусы
│   │   ├── Sidebar.svelte       # wizard shell, генерация
│   │   ├── StepZone.svelte      # шаг 1: выбор зоны
│   │   ├── StepPeople.svelte    # шаг 2: участники
│   │   ├── StepSettings.svelte  # шаг 3: расстояния + toggle маршрута
│   │   └── StepResult.svelte    # шаг 4: результат + навигация
│   ├── stores/
│   │   └── app.svelte.js        # $state, localStorage, actions
│   └── utils/
│       ├── geo.js               # haversine, point-in-polygon, random
│       ├── presets.js           # Минск (OSM-verified polygons)
│       └── routing.js           # Valhalla API + polyline6 decode
```
