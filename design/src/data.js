// src/data.js — Mock weather data for Turkish cities, with Mersin focus.
// All photos use reliable Unsplash photo IDs (auto-format, w=1600 crop).

const U = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Photo library — categorized by weather mood.
// Each city picks one as its hero based on its current condition.
window.PHOTOS = {
  // Mediterranean coast / sunny / clear
  sunnyCoast: [
    U('1507525428034-b723cf961d3e'),       // turquoise beach (Mersin-feel)
    U('1530870110042-98b2cb110834'),       // turkish coast
    U('1505142468610-359e7d316be0'),       // sea waves
  ],
  // Warm sunset
  goldenHour: [
    U('1495567720989-cebdbdd97913'),       // orange sky
    U('1500627964684-141351970a7f'),       // dusk
  ],
  // Citrus / orange grove (Mersin signature)
  citrusGrove: [
    U('1547514701-42782101795e'),          // orange grove
    U('1557800636-894a64c1696f'),          // citrus
  ],
  // Cloudy / overcast
  cloudy: [
    U('1438449805896-28a666819a20'),       // dramatic clouds
    U('1499346030926-9a72daac6c63'),       // grey sky
  ],
  // Rainy
  rainy: [
    U('1428592953211-077101b2021b'),       // rain window
    U('1493314894560-5c412a56c17c'),       // rainy street
  ],
  // Snowy / cold
  snowy: [
    U('1418985991508-e47386d96a71'),       // snow trees
    U('1483728642387-6c3bdd6c93e5'),       // snowy forest
  ],
  // Mountain / steppe (Ankara-like)
  steppe: [
    U('1464822759023-fed622ff2c3b'),       // mountain
    U('1454496522488-7a8e488e8606'),       // mountain dawn
  ],
  // City skyline (Istanbul-like)
  city: [
    U('1524231757912-21f4fe3a7200'),       // istanbul mosque
    U('1541432901042-2d8bd64b4a9b'),       // istanbul bosphorus
  ],
  // Night / clear
  night: [
    U('1419242902214-272b3f66ee7a'),       // starry night
    U('1532978379173-523e16f371f9'),       // moonlit sky
  ],
};

// Condition codes — keep in sync with iconography & translations.
//   clear, partly_cloudy, cloudy, rain, thunderstorm, snow, fog, windy
// Each city ships a 7-day forecast + hourly preview.

const day = (i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
};

window.CITIES = [
  {
    id: 'mersin',
    name: { tr: 'Mersin', en: 'Mersin' },
    region: { tr: 'Akdeniz · Türkiye', en: 'Mediterranean · Türkiye' },
    lat: 36.81, lon: 34.64,
    photoMood: 'sunnyCoast',
    current: {
      temp: 26, feels: 28, condition: 'clear',
      humidity: 58, wind: 12, pressure: 1014, uv: 7, visibility: 14,
    },
    sun: { rise: '05:42', set: '20:08' },
    hi: 28, lo: 19,
    hourly: [
      { t: 'şimdi', tempC: 26, c: 'clear' },
      { t: '15:00', tempC: 27, c: 'clear' },
      { t: '16:00', tempC: 28, c: 'clear' },
      { t: '17:00', tempC: 27, c: 'partly_cloudy' },
      { t: '18:00', tempC: 25, c: 'partly_cloudy' },
      { t: '19:00', tempC: 23, c: 'clear' },
      { t: '20:00', tempC: 22, c: 'clear' },
      { t: '21:00', tempC: 21, c: 'clear' },
    ],
    daily: [
      { day: day(0), c: 'clear',          hi: 28, lo: 19, pop: 0  },
      { day: day(1), c: 'clear',          hi: 29, lo: 20, pop: 0  },
      { day: day(2), c: 'partly_cloudy',  hi: 27, lo: 19, pop: 10 },
      { day: day(3), c: 'partly_cloudy',  hi: 26, lo: 18, pop: 20 },
      { day: day(4), c: 'rain',           hi: 23, lo: 17, pop: 70 },
      { day: day(5), c: 'rain',           hi: 22, lo: 16, pop: 80 },
      { day: day(6), c: 'cloudy',         hi: 24, lo: 17, pop: 30 },
    ],
  },
  {
    id: 'istanbul',
    name: { tr: 'İstanbul', en: 'Istanbul' },
    region: { tr: 'Marmara · Türkiye', en: 'Marmara · Türkiye' },
    lat: 41.01, lon: 28.97,
    photoMood: 'city',
    current: {
      temp: 19, feels: 18, condition: 'partly_cloudy',
      humidity: 72, wind: 22, pressure: 1011, uv: 4, visibility: 10,
    },
    sun: { rise: '05:31', set: '20:24' },
    hi: 22, lo: 14,
    hourly: [
      { t: 'şimdi', tempC: 19, c: 'partly_cloudy' },
      { t: '15:00', tempC: 21, c: 'partly_cloudy' },
      { t: '16:00', tempC: 22, c: 'cloudy' },
      { t: '17:00', tempC: 21, c: 'cloudy' },
      { t: '18:00', tempC: 19, c: 'rain' },
      { t: '19:00', tempC: 17, c: 'rain' },
      { t: '20:00', tempC: 16, c: 'cloudy' },
      { t: '21:00', tempC: 15, c: 'cloudy' },
    ],
    daily: [
      { day: day(0), c: 'partly_cloudy',  hi: 22, lo: 14, pop: 20 },
      { day: day(1), c: 'rain',           hi: 19, lo: 13, pop: 80 },
      { day: day(2), c: 'rain',           hi: 18, lo: 12, pop: 90 },
      { day: day(3), c: 'cloudy',         hi: 20, lo: 13, pop: 30 },
      { day: day(4), c: 'partly_cloudy',  hi: 23, lo: 14, pop: 10 },
      { day: day(5), c: 'clear',          hi: 25, lo: 15, pop: 0  },
      { day: day(6), c: 'clear',          hi: 26, lo: 16, pop: 0  },
    ],
  },
  {
    id: 'izmir',
    name: { tr: 'İzmir', en: 'Izmir' },
    region: { tr: 'Ege · Türkiye', en: 'Aegean · Türkiye' },
    lat: 38.42, lon: 27.14,
    photoMood: 'goldenHour',
    current: {
      temp: 24, feels: 25, condition: 'clear',
      humidity: 55, wind: 16, pressure: 1013, uv: 8, visibility: 16,
    },
    sun: { rise: '05:48', set: '20:18' },
    hi: 26, lo: 17,
    hourly: [
      { t: 'şimdi', tempC: 24, c: 'clear' },
      { t: '15:00', tempC: 25, c: 'clear' },
      { t: '16:00', tempC: 26, c: 'clear' },
      { t: '17:00', tempC: 25, c: 'clear' },
      { t: '18:00', tempC: 23, c: 'clear' },
      { t: '19:00', tempC: 21, c: 'clear' },
      { t: '20:00', tempC: 19, c: 'clear' },
      { t: '21:00', tempC: 18, c: 'clear' },
    ],
    daily: [
      { day: day(0), c: 'clear',          hi: 26, lo: 17, pop: 0  },
      { day: day(1), c: 'clear',          hi: 27, lo: 18, pop: 0  },
      { day: day(2), c: 'clear',          hi: 28, lo: 18, pop: 0  },
      { day: day(3), c: 'partly_cloudy',  hi: 26, lo: 17, pop: 10 },
      { day: day(4), c: 'partly_cloudy',  hi: 25, lo: 17, pop: 20 },
      { day: day(5), c: 'clear',          hi: 27, lo: 18, pop: 0  },
      { day: day(6), c: 'clear',          hi: 28, lo: 19, pop: 0  },
    ],
  },
  {
    id: 'antalya',
    name: { tr: 'Antalya', en: 'Antalya' },
    region: { tr: 'Akdeniz · Türkiye', en: 'Mediterranean · Türkiye' },
    lat: 36.89, lon: 30.71,
    photoMood: 'citrusGrove',
    current: {
      temp: 27, feels: 30, condition: 'clear',
      humidity: 62, wind: 9, pressure: 1015, uv: 9, visibility: 18,
    },
    sun: { rise: '05:39', set: '20:11' },
    hi: 30, lo: 20,
    hourly: [
      { t: 'şimdi', tempC: 27, c: 'clear' },
      { t: '15:00', tempC: 29, c: 'clear' },
      { t: '16:00', tempC: 30, c: 'clear' },
      { t: '17:00', tempC: 29, c: 'clear' },
      { t: '18:00', tempC: 27, c: 'clear' },
      { t: '19:00', tempC: 25, c: 'clear' },
      { t: '20:00', tempC: 23, c: 'clear' },
      { t: '21:00', tempC: 22, c: 'clear' },
    ],
    daily: [
      { day: day(0), c: 'clear',          hi: 30, lo: 20, pop: 0  },
      { day: day(1), c: 'clear',          hi: 31, lo: 21, pop: 0  },
      { day: day(2), c: 'clear',          hi: 32, lo: 22, pop: 0  },
      { day: day(3), c: 'clear',          hi: 31, lo: 21, pop: 0  },
      { day: day(4), c: 'partly_cloudy',  hi: 29, lo: 20, pop: 10 },
      { day: day(5), c: 'partly_cloudy',  hi: 28, lo: 20, pop: 20 },
      { day: day(6), c: 'clear',          hi: 30, lo: 21, pop: 0  },
    ],
  },
  {
    id: 'ankara',
    name: { tr: 'Ankara', en: 'Ankara' },
    region: { tr: 'İç Anadolu · Türkiye', en: 'Central Anatolia · Türkiye' },
    lat: 39.93, lon: 32.86,
    photoMood: 'steppe',
    current: {
      temp: 15, feels: 13, condition: 'cloudy',
      humidity: 48, wind: 18, pressure: 1018, uv: 5, visibility: 12,
    },
    sun: { rise: '05:25', set: '20:02' },
    hi: 18, lo: 8,
    hourly: [
      { t: 'şimdi', tempC: 15, c: 'cloudy' },
      { t: '15:00', tempC: 17, c: 'cloudy' },
      { t: '16:00', tempC: 18, c: 'partly_cloudy' },
      { t: '17:00', tempC: 17, c: 'partly_cloudy' },
      { t: '18:00', tempC: 14, c: 'cloudy' },
      { t: '19:00', tempC: 12, c: 'cloudy' },
      { t: '20:00', tempC: 10, c: 'cloudy' },
      { t: '21:00', tempC: 9,  c: 'clear' },
    ],
    daily: [
      { day: day(0), c: 'cloudy',         hi: 18, lo: 8,  pop: 30 },
      { day: day(1), c: 'partly_cloudy',  hi: 20, lo: 9,  pop: 10 },
      { day: day(2), c: 'clear',          hi: 22, lo: 10, pop: 0  },
      { day: day(3), c: 'clear',          hi: 23, lo: 11, pop: 0  },
      { day: day(4), c: 'partly_cloudy',  hi: 21, lo: 10, pop: 10 },
      { day: day(5), c: 'rain',           hi: 17, lo: 9,  pop: 70 },
      { day: day(6), c: 'cloudy',         hi: 18, lo: 9,  pop: 40 },
    ],
  },
  {
    id: 'trabzon',
    name: { tr: 'Trabzon', en: 'Trabzon' },
    region: { tr: 'Karadeniz · Türkiye', en: 'Black Sea · Türkiye' },
    lat: 41.00, lon: 39.72,
    photoMood: 'rainy',
    current: {
      temp: 14, feels: 12, condition: 'rain',
      humidity: 86, wind: 14, pressure: 1009, uv: 2, visibility: 6,
    },
    sun: { rise: '04:58', set: '19:48' },
    hi: 16, lo: 11,
    hourly: [
      { t: 'şimdi', tempC: 14, c: 'rain' },
      { t: '15:00', tempC: 15, c: 'rain' },
      { t: '16:00', tempC: 16, c: 'rain' },
      { t: '17:00', tempC: 15, c: 'cloudy' },
      { t: '18:00', tempC: 14, c: 'cloudy' },
      { t: '19:00', tempC: 13, c: 'rain' },
      { t: '20:00', tempC: 12, c: 'rain' },
      { t: '21:00', tempC: 11, c: 'cloudy' },
    ],
    daily: [
      { day: day(0), c: 'rain',           hi: 16, lo: 11, pop: 90 },
      { day: day(1), c: 'rain',           hi: 15, lo: 11, pop: 95 },
      { day: day(2), c: 'cloudy',         hi: 17, lo: 12, pop: 40 },
      { day: day(3), c: 'partly_cloudy',  hi: 19, lo: 13, pop: 20 },
      { day: day(4), c: 'rain',           hi: 16, lo: 12, pop: 70 },
      { day: day(5), c: 'cloudy',         hi: 17, lo: 12, pop: 30 },
      { day: day(6), c: 'partly_cloudy',  hi: 18, lo: 13, pop: 10 },
    ],
  },
  {
    id: 'erzurum',
    name: { tr: 'Erzurum', en: 'Erzurum' },
    region: { tr: 'Doğu Anadolu · Türkiye', en: 'Eastern Anatolia · Türkiye' },
    lat: 39.90, lon: 41.27,
    photoMood: 'snowy',
    current: {
      temp: 4, feels: 1, condition: 'snow',
      humidity: 78, wind: 24, pressure: 1020, uv: 3, visibility: 8,
    },
    sun: { rise: '05:00', set: '19:42' },
    hi: 7, lo: -2,
    hourly: [
      { t: 'şimdi', tempC: 4, c: 'snow' },
      { t: '15:00', tempC: 5, c: 'snow' },
      { t: '16:00', tempC: 6, c: 'cloudy' },
      { t: '17:00', tempC: 5, c: 'cloudy' },
      { t: '18:00', tempC: 3, c: 'snow' },
      { t: '19:00', tempC: 1, c: 'snow' },
      { t: '20:00', tempC: 0, c: 'cloudy' },
      { t: '21:00', tempC: -1, c: 'clear' },
    ],
    daily: [
      { day: day(0), c: 'snow',           hi: 7,  lo: -2, pop: 80 },
      { day: day(1), c: 'snow',           hi: 5,  lo: -3, pop: 90 },
      { day: day(2), c: 'cloudy',         hi: 9,  lo: 0,  pop: 30 },
      { day: day(3), c: 'partly_cloudy',  hi: 12, lo: 2,  pop: 10 },
      { day: day(4), c: 'clear',          hi: 14, lo: 3,  pop: 0  },
      { day: day(5), c: 'partly_cloudy',  hi: 13, lo: 2,  pop: 20 },
      { day: day(6), c: 'snow',           hi: 8,  lo: -1, pop: 60 },
    ],
  },
];

// Translations
window.I18N = {
  tr: {
    appName: 'Atmosfer',
    search: 'Şehir ara',
    feelsLike: 'hissedilen',
    high: 'yüksek',
    low: 'düşük',
    sunrise: 'gün doğumu',
    sunset: 'gün batımı',
    humidity: 'nem',
    wind: 'rüzgâr',
    pressure: 'basınç',
    uv: 'UV',
    visibility: 'görüş',
    sevenDay: '7 günlük tahmin',
    hourly: 'Saatlik',
    addCity: 'Şehir ekle',
    myCities: 'Şehirlerim',
    today: 'Bugün',
    now: 'şimdi',
    chanceRain: 'yağış',
    daylight: 'gün ışığı',
    overview: 'Genel bakış',
    conditions: {
      clear: 'açık', partly_cloudy: 'parçalı bulutlu', cloudy: 'bulutlu',
      rain: 'yağmurlu', thunderstorm: 'gök gürültülü', snow: 'karlı',
      fog: 'sisli', windy: 'rüzgârlı',
    },
    days: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
    daysLong: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
    months: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  },
  en: {
    appName: 'Atmosfer',
    search: 'Search city',
    feelsLike: 'feels like',
    high: 'high',
    low: 'low',
    sunrise: 'sunrise',
    sunset: 'sunset',
    humidity: 'humidity',
    wind: 'wind',
    pressure: 'pressure',
    uv: 'UV',
    visibility: 'visibility',
    sevenDay: '7-day forecast',
    hourly: 'Hourly',
    addCity: 'Add city',
    myCities: 'My cities',
    today: 'Today',
    now: 'now',
    chanceRain: 'precip',
    daylight: 'daylight',
    overview: 'Overview',
    conditions: {
      clear: 'clear', partly_cloudy: 'partly cloudy', cloudy: 'cloudy',
      rain: 'rain', thunderstorm: 'thunderstorm', snow: 'snow',
      fog: 'fog', windy: 'windy',
    },
    days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    daysLong: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  },
};

// Helper: get hero photo for a city based on its mood + condition.
window.cityPhoto = function(city, idx = 0) {
  const pool = window.PHOTOS[city.photoMood] || window.PHOTOS.sunnyCoast;
  return pool[idx % pool.length];
};
