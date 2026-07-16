export default {
  appTitle: 'Куда пойти?',

  // Steps
  stepZone: 'Выберите зону',
  stepPeople: 'Кто идёт?',
  stepDistance: 'Расстояние',
  stepPreferences: 'Предпочтения',
  stepResult: 'Результат',
  back: '← Назад',
  restart: 'Сначала',
  next: 'Далее',
  skip: 'Пропустить',

  // StepZone
  city: 'Город',
  zone: 'Зона',
  saveZone: 'Сохранить зону',
  zoneName: 'Название зоны',
  drawZone: 'Нарисовать зону',
  drawingHint: 'Рисуем — кликайте на карту...',
  districts: 'Районы',

  // StepPeople
  peopleHint: 'Кликните на карту, чтобы добавить участника. Маркеры можно перетаскивать.',
  nobodyYet: 'Пока никого нет',
  tapMapOrGps: 'Нажмите на карту или используйте GPS',
  namePlaceholder: 'Имя',
  defaultNameMe: 'Я',
  defaultNameFriend: 'Друг',

  // StepDistance
  notCloser: 'Не ближе',
  notFarther: 'Не дальше',
  km: 'км',
  m: 'м',
  minDistanceHint: 'Исключить зону в этом радиусе (фиолетовый круг на карте)',
  maxDistanceHint: 'Максимальный радиус поиска (жёлтый круг на карте)',

  // StepPreferences
  mode: 'Режим',
  attract: 'Интересно',
  repulse: 'Избегать',
  attractHint: 'Кликните на карту — место будет тяготеть к этим точкам',
  repulseHint: 'Кликните на карту — место будет избегать этих точек',
  attraction: 'Притяжение',
  repulsion: 'Отталкивание',
  influence: 'Влияние',
  attractRadiusHint: 'Чем ближе к точке, тем вероятнее результат',
  repulseRadiusHint: 'Чем ближе к точке, тем менее вероятен результат',
  tapToAddPoint: 'Кликните на карту, чтобы добавить точку',
  stepOptional: 'Шаг необязательный — можно пропустить',
  pointPlaceholder: 'Название',
  defaultPointName: 'Точка',
  generate: 'Куда пойти?',
  generating: 'Ищем...',

  // StepResult
  placeFound: 'Место найдено',
  detectingAddress: 'Определяем адрес...',
  copied: 'Скопировано!',
  share: 'Поделиться',
  anotherPlace: 'Другое место',
  searchingPlace: 'Ищем место...',
  yandexMaps: 'Яндекс Карты',
  shareText: (addr, lat, lng) =>
    `Куда пойти? Сюда: ${addr}\n\nGoogle Maps: https://www.google.com/maps?q=${lat},${lng}\nЯндекс Карты: https://yandex.ru/maps/?pt=${lng},${lat}&z=15`,

  // MapView
  drawClickHint: 'Кликайте для точек полигона',
  done: 'Готово',
  cancel: 'Отмена',

  // Errors
  zoneNotSet: 'Зона не задана.',
  generationFailed: 'Не удалось найти точку. Измените расстояния, зону или предпочтения.',

  // Theme
  themeLight: 'Светлая',
  themeSystem: 'Системная',
  themeDark: 'Тёмная',

  // Debug
  heatmapTitle: 'Тепловая карта вероятности',
  heatmapLegend: 'Вероятность выбора',
  heatmapHigh: 'Высокая',
  heatmapMedium: 'Средняя',
  heatmapLow: 'Низкая',
};
