// Karakter ve mekan verileri
// Görseller: public/assets/characters/ ve public/assets/locations/ klasörlerine koyulacak

export const GIRL_CHARACTERS = [
  { id: 'human_1', name: { tr: 'Prenses Elif', en: 'Princess Emma' }, file: 'girl1.png' },
  { id: 'human_2', name: { tr: 'Şirin Damla', en: 'Cute Mia' },  file: 'girl2.png' },
  { id: 'human_3', name: { tr: 'Minik Neşe', en: 'Little Lily' },  file: 'girl3.png' },
  { id: 'human_4', name: { tr: 'Tatlı kalpli Deniz', en: 'Princess Sofia' },  file: 'girl4.png' },
  { id: 'human_5', name: { tr: 'Çalışkan Rukiye', en: 'Princess Ella' }, file: 'girl5.png' },
];

export const BOY_CHARACTERS = [
  { id: 'human_1', name: { tr: 'Meraklı Berke', en: 'Curious Noah' }, file: 'boy1.png' },
  { id: 'human_2', name: { tr: 'Cesur Ali', en: 'Hero Lucas' },  file: 'boy2.png' },
  { id: 'human_3', name: { tr: ' Maceracı Mehmet', en: 'Adventurous Lucas' },  file: 'boy3.png' },
  { id: 'human_4', name: { tr: 'Arkadaş canlısı Deniz', en: 'Friendly Noah' }, file: 'boy4.png' },
  { id: 'human_5', name: { tr: ' Mutlu Bilge', en: 'Happy Oliver' },  file: 'boy5.png' },
];

export const ANIMAL_CHARACTERS = [
  { id: 'animal_1', name: { tr: 'Oyuncu köpek Tarçın', en: 'Playful Puppy Max' }, emoji: '🦁', file: 'animal1.png' },
  { id: 'animal_2', name: { tr: 'Meraklı kedi Pati', en: 'Curious Kitty Luna' }, emoji: '🦊', file: 'animal2.png' },
  { id: 'animal_3', name: { tr: 'İyi kalpli ayı ', en: 'Kind Bear ' }, emoji: '🐘', file: 'animal3.png' },
  { id: 'animal_4', name: { tr: 'Zeki tilki', en: 'Clever Foxy' }, emoji: '🦄', file: 'animal4.png' },
  { id: 'animal_5', name: { tr: 'Küçük Tavşan  ', en: 'Little Bunny ' }, emoji: '🦉', file: 'animal5.png' },
];

export const LOCATIONS = [
  { id: 'loc_1', name: { tr: 'Büyülü Orman', en: 'Enchanted Forest' }, emoji: '🌲', file: 'orman.png' },
  { id: 'loc_2', name: { tr: 'Karlar Ülkesi', en: 'Frozen' }, emoji: '🏰', file: 'frozen.png' },
  { id: 'loc_3', name: { tr: 'Macera Adası', en: 'Adventure Island ' }, emoji: '☁️', file: 'ada.png' },
  { id: 'loc_4', name: { tr: 'Uzay Gemisi', en: 'Space Ship' }, emoji: '🚀', file: 'uzay.png' },
  { id: 'loc_5', name: { tr: 'Gökkuşağı Vadisi', en: 'Rainbow Valley' }, emoji: '🗺️', file: 'gok.png' },
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
