// Karakter ve mekan verileri
// Görseller: public/assets/characters/ ve public/assets/locations/ klasörlerine koyulacak

export const ALL_CHARACTERS = [
  { id: 'human_g1',  name: { tr: 'Prenses Elif',    en: 'Princess Emma'   }, file: 'girl1.png',  emoji: '👧' },
  { id: 'human_g2',  name: { tr: 'Şirin Damla',     en: 'Cute Mia'        }, file: 'girl2.png',  emoji: '👧' },
  { id: 'human_g3',  name: { tr: 'Minik Neşe',      en: 'Little Lily'     }, file: 'girl3.png',  emoji: '👧' },
  { id: 'human_g4',  name: { tr: 'Tatlı Deniz',     en: 'Princess Sofia'  }, file: 'girl4.png',  emoji: '👧' },
  { id: 'human_g5',  name: { tr: 'Çalışkan Rukiye', en: 'Princess Ella'   }, file: 'girl5.png',  emoji: '👧' },
  { id: 'human_g6',  name: { tr: 'Neşeli Zeynep',   en: 'Cheerful Zoe'    }, file: 'girl6.png',  emoji: '👧' },
  { id: 'human_g7',  name: { tr: 'Zarif Lian',      en: 'Graceful Lian'   }, file: 'girl7.png',  emoji: '👧' },
  { id: 'human_g8',  name: { tr: 'Işıltılı Priya',  en: 'Radiant Priya'   }, file: 'girl8.png',  emoji: '👧' },
  { id: 'human_g9',  name: { tr: 'Sevimli Yuki',    en: 'Cute Yuki'       }, file: 'girl9.png',  emoji: '👧' },
  { id: 'human_g10', name: { tr: 'Şen Elif',        en: 'Jolly Ella'      }, file: 'girl10.png', emoji: '👧' },
  { id: 'human_g11', name: { tr: 'Deniz Kızı Su',   en: 'Sunny Belle'     }, file: 'girl11.png', emoji: '🏖️' },
  { id: 'human_g12', name: { tr: 'Çiçekli Sarı',    en: 'Daisy Lou'       }, file: 'girl12.png', emoji: '👧' },

  { id: 'human_b1',  name: { tr: 'Meraklı Berke',         en: 'Curious Noah'      }, file: 'boy1.png',  emoji: '👦' },
  { id: 'human_b2',  name: { tr: 'Cesur Ali',              en: 'Hero Lucas'        }, file: 'boy2.png',  emoji: '👦' },
  { id: 'human_b3',  name: { tr: 'Maceracı Mehmet',        en: 'Adventurous Lucas' }, file: 'boy3.png',  emoji: '👦' },
  { id: 'human_b4',  name: { tr: 'Arkadaş Canlısı Deniz',  en: 'Friendly Noah'     }, file: 'boy4.png',  emoji: '👦' },
  { id: 'human_b5',  name: { tr: 'Mutlu Bilge',            en: 'Happy Oliver'      }, file: 'boy5.png',  emoji: '👦' },
  { id: 'human_b6',  name: { tr: 'Akıllı Kerem',           en: 'Smart Ethan'       }, file: 'boy6.png',  emoji: '👦' },
  { id: 'human_b7',  name: { tr: 'Neşeli Tuncay',          en: 'Sunny Jack'        }, file: 'boy7.png',  emoji: '👦' },
  { id: 'human_b8',  name: { tr: 'Barışçıl Hiro',          en: 'Peaceful Hiro'     }, file: 'boy8.png',  emoji: '👦' },
  { id: 'human_b9',  name: { tr: 'Yiğit Kartal',           en: 'Brave Eagle'       }, file: 'boy9.png',  emoji: '👦' },
  { id: 'human_b10', name: { tr: 'Enerjik Kaan',           en: 'Energetic Kyle'    }, file: 'boy10.png', emoji: '👦' },
  { id: 'human_b11', name: { tr: 'Güçlü Demir',            en: 'Strong Sam'        }, file: 'boy11.png', emoji: '👦' },
  { id: 'human_b12', name: { tr: 'Dalgıç Mert',            en: 'Diver Max'         }, file: 'boy12.png', emoji: '🏄' },

  { id: 'animal_1',  name: { tr: 'Oyuncu Tarçın',   en: 'Playful Max'       }, file: 'animal1.png',   emoji: '🐶' },
  { id: 'animal_2',  name: { tr: 'Meraklı Pati',    en: 'Curious Luna'      }, file: 'animal2.png',   emoji: '🐱' },
  { id: 'animal_3',  name: { tr: 'İyi Kalpli Ayı',  en: 'Kind Bear'         }, file: 'animal3.png',   emoji: '🐻' },
  { id: 'animal_4',  name: { tr: 'Zeki Tilki',       en: 'Clever Foxy'       }, file: 'animal4.png',   emoji: '🦊' },
  { id: 'animal_5',  name: { tr: 'Küçük Tavşan',    en: 'Little Bunny'      }, file: 'animal5.png',   emoji: '🐰' },
  { id: 'animal_6',  name: { tr: 'Bilge Baykuş',    en: 'Wise Owl'          }, file: 'owl.png',       emoji: '🦉' },
  { id: 'animal_7',  name: { tr: 'Neşeli Fil',       en: 'Cheerful Elephant' }, file: 'elephant.png',  emoji: '🐘' },
  { id: 'animal_8',  name: { tr: 'Uysal Koala',      en: 'Sleepy Koala'      }, file: 'koala.png',     emoji: '🐨' },
  { id: 'animal_9',  name: { tr: 'Şen Ördek',        en: 'Happy Duck'        }, file: 'duck.png',      emoji: '🦆' },
  { id: 'animal_10', name: { tr: 'Tatlı Kirpi',      en: 'Sweet Hedgehog'    }, file: 'hedgehog.png',  emoji: '🦔' },
  { id: 'animal_11', name: { tr: 'Zarif Geyik',      en: 'Gentle Deer'       }, file: 'deer.png',      emoji: '🦌' },
  { id: 'animal_16', name: { tr: 'Yeşil Timsah',     en: 'Green Croc'        }, file: 'crocodile.png', emoji: '🐊' },
  { id: 'animal_12', name: { tr: 'Sevimli Zürafa',   en: 'Cute Giraffe'      }, file: 'animal6.png',   emoji: '🐼' },
  { id: 'animal_13', name: { tr: 'Cesur Aslan',      en: 'Brave Leo'         }, file: 'lion.png',      emoji: '🦁' },
  { id: 'animal_14', name: { tr: 'Şen Penguen',      en: 'Happy Penguin'     }, file: 'penguin.png',   emoji: '🐧' },
  { id: 'animal_15', name: { tr: 'Maymun Coco',      en: 'Monkey Coco'       }, file: 'monkey.png',    emoji: '🐒' },
  { id: 'animal_17', name: { tr: 'Minik Kaplumbağa', en: 'Little Turtle'     }, file: 'turtle.png',    emoji: '🐢' },
  { id: 'animal_18', name: { tr: 'Utangaç Flamingo', en: 'Shy Flamingo'      }, file: 'flamingo.png',  emoji: '🦩' },
];

// Geriye dönük uyumluluk için (BookViewer vs)
export const GIRL_CHARACTERS   = ALL_CHARACTERS.filter(c => c.id.startsWith('human_g'));
export const BOY_CHARACTERS    = ALL_CHARACTERS.filter(c => c.id.startsWith('human_b'));
export const ANIMAL_CHARACTERS = ALL_CHARACTERS.filter(c => c.id.startsWith('animal'));

export const LOCATIONS = [
  { id: 'loc_1',  name: { tr: 'Büyülü Orman',    en: 'Enchanted Forest'  }, emoji: '🌲',  file: 'orman2.png'  },
  { id: 'loc_2',  name: { tr: 'Karlar Ülkesi',   en: 'Frozen Kingdom'    }, emoji: '🏰',  file: 'frozen2.png' },
  { id: 'loc_3',  name: { tr: 'Korsan Adası',     en: 'Pirate Island'     }, emoji: '🏴‍☠️', file: 'pirate.png'  },
  { id: 'loc_4',  name: { tr: 'Uzay İstasyonu',  en: 'Space Station'     }, emoji: '🚀',  file: 'space.png'   },
  { id: 'loc_5',  name: { tr: 'Su Altı Sarayı',  en: 'Underwater Palace' }, emoji: '🌊',  file: 'underwater.png' },
  { id: 'loc_6',  name: { tr: 'Şeker Diyarı',    en: 'Candy Land'        }, emoji: '🍬',  file: 'candy.png'   },
  { id: 'loc_7',  name: { tr: 'Lunapark',         en: 'Amusement Park'    }, emoji: '🎡',  file: 'lunapark.png' },
  { id: 'loc_8',  name: { tr: 'Park',             en: 'Park'              }, emoji: '🌳',  file: 'park.png'    },
  { id: 'loc_9',  name: { tr: 'Hayvanat Bahçesi', en: 'Zoo'               }, emoji: '🦁',  file: 'zoo.png'     },
  { id: 'loc_10', name: { tr: 'Sahil',            en: 'Beach'             }, emoji: '🏖️',  file: 'beach.png'   },
  { id: 'loc_11', name: { tr: 'Okul',             en: 'School'            }, emoji: '🏫',  file: 'school.png'  },
  { id: 'loc_12', name: { tr: 'Kar Diyarı',       en: 'Snow Land'         }, emoji: '⛷️',  file: 'snow.png'    },
];

export const AGE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const DURATION_OPTIONS = [
  { value: 'short',  labelKey: 'durationShort',  icon: '⚡' },
  { value: 'medium', labelKey: 'durationMedium', icon: '📖' },
  { value: 'long',   labelKey: 'durationLong',   icon: '📚' },
];

export const STORY_LANGUAGES = [
  { value: 'tr', label: '🇹 Türkçe' },
  { value: 'en', label: '🇬 English' },
];