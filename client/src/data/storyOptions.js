// Karakter ve mekan verileri
// Görseller: public/assets/characters/ ve public/assets/locations/ klasörlerine koyulacak

export const ALL_CHARACTERS = [
  { id: 'human_g1', name: { tr: 'Prenses Elif', en: 'Princess Emma' }, file: 'girl1.png', emoji: '👧' },
  { id: 'human_g2', name: { tr: 'Şirin Damla', en: 'Cute Mia' },       file: 'girl2.png', emoji: '👧' },
  { id: 'human_g3', name: { tr: 'Minik Neşe', en: 'Little Lily' },     file: 'girl3.png', emoji: '👧' },
  { id: 'human_g4', name: { tr: 'Tatlı Deniz', en: 'Princess Sofia' }, file: 'girl4.png', emoji: '👧' },
  { id: 'human_g5', name: { tr: 'Çalışkan Rukiye', en: 'Princess Ella' }, file: 'girl5.png', emoji: '👧' },
  { id: 'human_b1', name: { tr: 'Meraklı Berke', en: 'Curious Noah' }, file: 'boy1.png', emoji: '👦' },
  { id: 'human_b2', name: { tr: 'Cesur Ali', en: 'Hero Lucas' },        file: 'boy2.png', emoji: '👦' },
  { id: 'human_b3', name: { tr: 'Maceracı Mehmet', en: 'Adventurous Lucas' }, file: 'boy3.png', emoji: '👦' },
  { id: 'human_b4', name: { tr: 'Arkadaş Canlısı Deniz', en: 'Friendly Noah' }, file: 'boy4.png', emoji: '👦' },
  { id: 'human_b5', name: { tr: 'Mutlu Bilge', en: 'Happy Oliver' },   file: 'boy5.png', emoji: '👦' },
  { id: 'animal_1', name: { tr: 'Oyuncu Tarçın', en: 'Playful Max' },   file: 'animal1.png',  emoji: '🐶' },
  { id: 'animal_2', name: { tr: 'Meraklı Pati', en: 'Curious Luna' },   file: 'animal2.png',  emoji: '🐱' },
  { id: 'animal_3', name: { tr: 'İyi Kalpli Ayı', en: 'Kind Bear' },    file: 'animal3.png',  emoji: '🐻' },
  { id: 'animal_4', name: { tr: 'Zeki Tilki', en: 'Clever Foxy' },      file: 'animal4.png',  emoji: '🦊' },
  { id: 'animal_5', name: { tr: 'Küçük Tavşan', en: 'Little Bunny' },   file: 'animal5.png',  emoji: '🐰' },
  { id: 'animal_6', name: { tr: 'Bilge Baykuş', en: 'Wise Owl' },       file: 'owl.png',      emoji: '🦉' },
  { id: 'animal_7', name: { tr: 'Neşeli Fil', en: 'Cheerful Elephant' }, file: 'elephant.png', emoji: '🐘' },
  { id: 'animal_8', name: { tr: 'Uysal Koala', en: 'Sleepy Koala' },    file: 'koala.png',    emoji: '🐨' },
  { id: 'animal_9', name: { tr: 'Şen Ördek', en: 'Happy Duck' },        file: 'duck.png',     emoji: '🦆' },
  { id: 'animal_10', name: { tr: 'Tatlı Kirpi', en: 'Sweet Hedgehog' }, file: 'hedgehog.png', emoji: '🦔' },
  { id: 'animal_11', name: { tr: 'Zarif Geyik', en: 'Gentle Deer' },    file: 'deer.png',     emoji: '🦌' },
];

// Geriye dönük uyumluluk için (BookViewer vs)
export const GIRL_CHARACTERS   = ALL_CHARACTERS.filter(c => c.id.startsWith('human_g'));
export const BOY_CHARACTERS    = ALL_CHARACTERS.filter(c => c.id.startsWith('human_b'));
export const ANIMAL_CHARACTERS = ALL_CHARACTERS.filter(c => c.id.startsWith('animal'));

export const LOCATIONS = [
  { id: 'loc_1', name: { tr: 'Büyülü Orman',    en: 'Enchanted Forest'  }, emoji: '🌲', file: 'orman2.png'  },
  { id: 'loc_2', name: { tr: 'Karlar Ülkesi',   en: 'Frozen Kingdom'    }, emoji: '🏰', file: 'frozen2.png' },
  { id: 'loc_3', name: { tr: 'Korsan Adası',     en: 'Pirate Island'    }, emoji: '🏴‍☠️', file: 'pirate.png' },
  { id: 'loc_4', name: { tr: 'Uzay İstasyonu',  en: 'Space Station'    }, emoji: '🚀', file: 'space.png' },
  { id: 'loc_5', name: { tr: 'Su Altı Sarayı',  en: 'Underwater Palace'}, emoji: '🌊', file: 'underwater.png' },
  { id: 'loc_6', name: { tr: 'Şeker Diyarı',    en: 'Candy Land'       }, emoji: '🍬', file: 'candy.png' },
  { id: 'loc_7', name: { tr: 'Lunapark',         en: 'Amusement Park'   }, emoji: '🎡', file: 'lunapark.png' },
  { id: 'loc_8', name: { tr: 'Park',             en: 'Park'             }, emoji: '🌳', file: 'park.png' },
  { id: 'loc_9', name: { tr: 'Hayvanat Bahçesi', en: 'Zoo'              }, emoji: '🦁', file: 'zoo.png' },
];

export const AGE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const DURATION_OPTIONS = [
  { value: 'short',  labelKey: 'durationShort',  icon: '⚡' },
  { value: 'medium', labelKey: 'durationMedium', icon: '📖' },
  { value: 'long',   labelKey: 'durationLong',   icon: '📚' },
];

export const STORY_LANGUAGES = [
  { value: 'tr', label: '🇹🇷 Türkçe' },
  { value: 'en', label: '🇬🇧 English' },
];
