// Karakter ve mekan verileri
// Görseller: public/assets/characters/ ve public/assets/locations/ klasörlerine koyulacak

export const GIRL_CHARACTERS = [
  { id: 'human_1', name: { tr: 'Prenses Elif', en: 'Princess Elif' }, file: 'girl1.png' },
  { id: 'human_2', name: { tr: 'Prenses Leyla', en: 'Princess Leyla' },  file: 'girl2.png' },
  { id: 'human_3', name: { tr: 'Prenses Nese', en: 'Princess Nese' },  file: 'girl3.png' },
  { id: 'human_4', name: { tr: 'Prenses Deniz', en: 'Princess Deniz' },  file: 'girl4.png' },
  { id: 'human_5', name: { tr: 'Prenses Leyla', en: 'Princess Leyla' }, file: 'girl5.png' },
];

export const BOY_CHARACTERS = [
  { id: 'human_1', name: { tr: 'Berke', en: 'Berke' }, file: 'boy1.png' },
  { id: 'human_2', name: { tr: 'Kahraman Ali', en: 'Hero Ali' },  file: 'boy2.png' },
  { id: 'human_3', name: { tr: 'Mehmet', en: 'Mehmet' },  file: 'boy3.png' },
  { id: 'human_4', name: { tr: 'Deniz', en: 'Deniz' }, file: 'boy4.png' },
  { id: 'human_5', name: { tr: 'Bilge', en: 'Bilge' },  file: 'boy5.png' },
];

export const ANIMAL_CHARACTERS = [
  { id: 'animal_1', name: { tr: 'Cesur Aslan Leo', en: 'Brave Lion Leo' }, emoji: '🦁', file: 'animal1.png' },
  { id: 'animal_2', name: { tr: 'Zeki Tilki Foxy', en: 'Clever Fox Foxy' }, emoji: '🦊', file: 'animal2.png' },
  { id: 'animal_3', name: { tr: 'Neşeli Fil Dumbo', en: 'Happy Elephant Dumbo' }, emoji: '🐘', file: 'animal3.png' },
  { id: 'animal_4', name: { tr: 'Sihirli Pegasus', en: 'Magic Pegasus' }, emoji: '🦄', file: 'animal4.png' },
  { id: 'animal_5', name: { tr: 'Uçan Baykuş Ulu', en: 'Flying Owl Ulu' }, emoji: '🦉', file: 'animal5.png' },
];

export const LOCATIONS = [
  { id: 'loc_1', name: { tr: 'Büyülü Orman', en: 'Enchanted Forest' }, emoji: '🌲', file: 'loc_1.png' },
  { id: 'loc_2', name: { tr: 'Deniz Altı Sarayı', en: 'Underwater Palace' }, emoji: '🏰', file: 'loc_2.png' },
  { id: 'loc_3', name: { tr: 'Bulutlar Ülkesi', en: 'Cloud Kingdom' }, emoji: '☁️', file: 'loc_3.png' },
  { id: 'loc_4', name: { tr: 'Yıldızlı Uzay', en: 'Starry Space' }, emoji: '🚀', file: 'loc_4.png' },
  { id: 'loc_5', name: { tr: 'Gizemli Mağara', en: 'Mystery Cave' }, emoji: '🗺️', file: 'loc_5.png' },
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
