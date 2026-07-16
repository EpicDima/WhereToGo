export default {
  appTitle: 'Where to go?',
  ok: 'OK',

  // Cities & zones
  'city.minsk': 'Minsk',
  'zone.wide': 'Whole city',
  'zone.mkad': 'Ring road',
  'zone.center': 'Center',

  // Districts
  'district.Центральный': 'Central',
  'district.Советский': 'Sovetsky',
  'district.Первомайский': 'Pervomaisky',
  'district.Партизанский': 'Partizansky',
  'district.Заводской': 'Zavodskoy',
  'district.Ленинский': 'Leninsky',
  'district.Октябрьский': 'Oktyabrsky',
  'district.Московский': 'Moskovsky',
  'district.Фрунзенский': 'Frunzensky',

  switchLang: 'Переключить на русский',

  // Steps
  stepZone: 'Choose a zone',
  stepPeople: 'Who\'s going?',
  stepDistance: 'Distance',
  stepPreferences: 'Preferences',
  stepResult: 'Result',
  back: '← Back',
  restart: 'Start over',
  next: 'Next',
  skip: 'Skip',

  // StepZone
  city: 'City',
  zone: 'Zone',
  saveZone: 'Save zone',
  zoneName: 'Zone name',
  drawZone: 'Draw a zone',
  drawingHint: 'Drawing — click on the map...',
  districts: 'Districts',

  // StepPeople
  peopleHint: 'Click on the map to add a person. Markers are draggable.',
  nobodyYet: 'Nobody yet',
  tapMapOrGps: 'Tap the map or use GPS',
  namePlaceholder: 'Name',
  defaultNameMe: 'Me',
  defaultNameFriend: 'Friend',

  // StepDistance
  notCloser: 'Not closer than',
  notFarther: 'Not farther than',
  km: 'km',
  m: 'm',
  minDistanceHint: 'Exclude this radius zone (purple circle on the map)',
  maxDistanceHint: 'Maximum search radius (yellow circle on the map)',

  // StepPreferences
  mode: 'Mode',
  attract: 'Attract',
  repulse: 'Avoid',
  attractHint: 'Click the map — the place will gravitate towards these points',
  repulseHint: 'Click the map — the place will avoid these points',
  attraction: 'Attraction',
  repulsion: 'Repulsion',
  influence: 'Influence',
  attractRadiusHint: 'The closer to the point, the more likely the result',
  repulseRadiusHint: 'The closer to the point, the less likely the result',
  tapToAddPoint: 'Click the map to add a point',
  stepOptional: 'This step is optional — you can skip it',
  pointPlaceholder: 'Name',
  defaultPointName: 'Point',
  generate: 'Where to go?',
  generating: 'Searching...',

  // StepResult
  placeFound: 'Place found',
  detectingAddress: 'Detecting address...',
  copied: 'Copied!',
  share: 'Share',
  anotherPlace: 'Another place',
  searchingPlace: 'Searching for a place...',
  yandexMaps: 'Yandex Maps',
  shareText: (addr, lat, lng) =>
    `Where to go? Here: ${addr}\n\nGoogle Maps: https://www.google.com/maps?q=${lat},${lng}\nYandex Maps: https://yandex.ru/maps/?pt=${lng},${lat}&z=15`,

  // MapView
  drawClickHint: 'Click to add polygon points',
  done: 'Done',
  cancel: 'Cancel',

  // Errors
  zoneNotSet: 'Zone is not set.',
  generationFailed: 'Could not find a point. Adjust distances, zone, or preferences.',

  // Theme
  themeLight: 'Light',
  themeSystem: 'System',
  themeDark: 'Dark',

  // Debug
  heatmapTitle: 'Probability heatmap',
  heatmapLegend: 'Selection probability',
  heatmapHigh: 'High',
  heatmapMedium: 'Medium',
  heatmapLow: 'Low',
};
