export const POI_CATEGORIES = {
  parks: { name: 'Парки', emoji: '🌳' },
  cafes: { name: 'Кафе и бары', emoji: '☕' },
  culture: { name: 'Культура', emoji: '🎭' },
  sport: { name: 'Спорт', emoji: '⚽' },
  shops: { name: 'Шоппинг', emoji: '🛍' },
};

export const MINSK_POIS = {
  parks: [
    { name: 'Парк Горького', lng: 27.5890, lat: 53.9005 },
    { name: 'Парк Челюскинцев', lng: 27.6120, lat: 53.9210 },
    { name: 'Лошицкий парк', lng: 27.5450, lat: 53.8710 },
    { name: 'Парк Победы', lng: 27.5100, lat: 53.9140 },
    { name: 'Ботанический сад', lng: 27.6200, lat: 53.9140 },
    { name: 'Парк Дружбы народов', lng: 27.5340, lat: 53.9350 },
    { name: 'Севастопольский парк', lng: 27.5640, lat: 53.9060 },
  ],
  cafes: [
    { name: 'Зыбицкая (барная)', lng: 27.5560, lat: 53.9020 },
    { name: 'Октябрьская (креативная)', lng: 27.5680, lat: 53.8920 },
    { name: 'Верхний город', lng: 27.5540, lat: 53.9050 },
    { name: 'ТЦ Галилео', lng: 27.5420, lat: 53.9170 },
    { name: 'ТЦ Дана Молл', lng: 27.4860, lat: 53.8620 },
  ],
  culture: [
    { name: 'Большой театр', lng: 27.5610, lat: 53.9080 },
    { name: 'Нац. библиотека', lng: 27.6470, lat: 53.9310 },
    { name: 'Музей ВОВ', lng: 27.5390, lat: 53.9140 },
    { name: 'Нац. худ. музей', lng: 27.5620, lat: 53.9010 },
    { name: 'Троицкое предместье', lng: 27.5540, lat: 53.9070 },
  ],
  sport: [
    { name: 'Минск-Арена', lng: 27.5390, lat: 53.9280 },
    { name: 'Динамо стадион', lng: 27.5670, lat: 53.8970 },
    { name: 'Чижовка-Арена', lng: 27.5920, lat: 53.8680 },
    { name: 'Дворец спорта', lng: 27.5530, lat: 53.9110 },
  ],
  shops: [
    { name: 'ГУМ', lng: 27.5530, lat: 53.8990 },
    { name: 'Galleria Minsk', lng: 27.5470, lat: 53.9090 },
    { name: 'Замок', lng: 27.5860, lat: 53.9250 },
    { name: 'Expobel', lng: 27.6150, lat: 53.9300 },
  ],
};

export function getActivePOIs(categories) {
  const pois = [];
  for (const cat of categories) {
    if (MINSK_POIS[cat]) {
      pois.push(...MINSK_POIS[cat]);
    }
  }
  return pois;
}
