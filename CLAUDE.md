# Where To Go — Куда пойти?

Web-приложение для случайного выбора места на карте города.

## Что делает приложение

1. Карта на весь экран (MapLibre GL JS + Carto тайлы, светлая/тёмная)
2. Пошаговый wizard: Зона → Люди → Расстояние → Предпочтения → Результат
3. Зоны из пресетов (Минск МКАД / центр) или рисование своей
4. Несколько участников с drag-маркерами + GPS + сохранение
5. Мин/макс расстояние с визуализацией кругов на карте
6. Точки притяжения/отталкивания для тонкой настройки генерации
7. Генерация случайной точки (haversine) + перегенерация без рестарта
8. Reverse geocoding (Nominatim) — адрес рядом с координатами
9. Шаринг результата (Web Share API / буфер обмена)
10. Per-friend навигация: Google Maps / Яндекс с origin→destination
11. Тёмная тема, localStorage, 2D-only карта
12. Адаптивный мобильный интерфейс с bottom sheet

## Стек

- **Svelte 5** + Vite 8 (порт 51269)
- **MapLibre GL JS** + Carto Voyager / Dark Matter
- **@turf/turf** (geo-утилиты)
- **Tailwind CSS v4** (@theme)
- **Nominatim** (reverse geocoding, адреса)
- Без бэкенда

## Дизайн

- Floating glass panel поверх full-bleed карты (backdrop-blur)
- Акцент: coral #E8584A
- Круги расстояний: indigo #6366F1 (мин), amber #F59E0B (макс)
- Dark mode: Carto Dark Matter + тёмные CSS variables
- Шрифты: Inter + Plus Jakarta Sans

## Команды

```bash
npm run dev      # localhost:51269
npm run build    # production
npm run preview  # preview build
```

## Структура (Feature-Sliced)

```
src/
├── App.svelte
├── app.css                        # Tailwind @theme, dark mode vars, glass
├── main.js
├── lib/
│   ├── shared/                    # общие модули
│   │   ├── ui/                    # переиспользуемые UI-компоненты
│   │   │   ├── Chip.svelte        # кнопка-чип (города, районы)
│   │   │   ├── CloseButton.svelte # кнопка удаления ×
│   │   │   ├── Label.svelte       # цветная метка (green/red)
│   │   │   ├── PointCard.svelte   # карточка точки (люди, предпочтения)
│   │   │   ├── SecondaryButton.svelte # ghost-кнопка (GPS, сохранение)
│   │   │   └── Spinner.svelte     # SVG-спиннер загрузки
│   │   ├── stores/
│   │   │   ├── persist.js         # localStorage registry + save/load
│   │   │   ├── app.svelte.js      # step, theme, generatedPoint
│   │   │   └── ui.svelte.js       # shared UI state (mobile sheet height)
│   │   ├── utils/
│   │   │   ├── geo.js             # haversine, point-in-polygon, random
│   │   │   ├── districts.js       # полигоны районов Минска
│   │   │   └── presets.js         # Минск (OSM-verified polygons)
│   │   └── i18n/
│   │       ├── index.svelte.js    # реактивный i18n ($state locale)
│   │       ├── ru.js              # русские строки
│   │       └── en.js              # английские строки
│   ├── features/                  # шаги wizard + domain stores
│   │   ├── zone/
│   │   │   ├── store.svelte.js    # стейт зон, город, пресеты
│   │   │   └── StepZone.svelte    # шаг 0: выбор зоны
│   │   ├── people/
│   │   │   ├── store.svelte.js    # стейт участников
│   │   │   └── StepPeople.svelte  # шаг 1: участники
│   │   ├── distance/
│   │   │   ├── store.svelte.js    # стейт расстояний
│   │   │   └── StepDistance.svelte # шаг 2: расстояния
│   │   ├── preferences/
│   │   │   ├── store.svelte.js    # стейт предпочтений
│   │   │   └── StepPreferences.svelte # шаг 3: притяжение/отталкивание
│   │   └── result/
│   │       ├── generate.js        # оркестрация генерации точки
│   │       └── StepResult.svelte  # шаг 4: результат + навигация + шаринг
│   └── widgets/                   # композитные компоненты
│       ├── map/
│       │   ├── MapView.svelte     # карта, маркеры, эффекты
│       │   ├── layers.js          # GeoJSON-слои (зоны, радиусы, рисование)
│       │   ├── markers.js         # DOM-фабрики маркеров
│       │   └── debug.js           # DEV heatmap (вероятности генерации)
│       ├── Sidebar.svelte         # wizard shell, генерация, bottom sheet
│       └── ThemeToggle.svelte     # тема + язык
```
