/**
 * Tuzla Pilot Bölge — 55+ Restoran Seed Data
 * Öğrenci-uygun fiyatlar, kampüs yakını
 */
const TUZLA_RESTAURANTS = [
  {
    "name": "Tuzla Pide Salonu",
    "cuisine": "Turkish",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.3,
    "price_level": 1,
    "calories_min": 450,
    "calories_max": 750,
    "description": "Karadeniz usulu pide cesitleri, taze hamur vebol malzeme ile hazirlanan geleneksel lezzetler.",
    "tags": [
      "pide",
      "karadeniz",
      "firin",
      "ogrenci"
    ],
    "address": "Merkez Mah. Sahil Cad. No:12, Tuzla, Istanbul",
    "phone": "0216 395 10 01",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Sucuklu Yumurta Pide",
        "emoji": "🥚"
      },
      {
        "name": "Etli Ekmek",
        "emoji": "🫓"
      },
      {
        "name": "Midye Dolma",
        "emoji": "🐚"
      }
    ]
  },
  {
    "name": "Kampus Doner",
    "cuisine": "Turkish",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 4.1,
    "price_level": 1,
    "calories_min": 500,
    "calories_max": 800,
    "description": "Ogrencilerin vazgecilmez doner duragı. Porsiyon doner, durum ve iskender cesitleri.",
    "tags": [
      "doner",
      "durum",
      "iskender",
      "ogrenci",
      "hizli"
    ],
    "address": "Universite Mah. Kampus Yolu Cad. No:5, Tuzla, Istanbul",
    "phone": "0216 395 20 02",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Iskender",
        "emoji": "🍖"
      },
      {
        "name": "Porsiyon Doner",
        "emoji": "🍽️"
      },
      {
        "name": "Yaprak Doner",
        "emoji": "🥩"
      }
    ]
  },
  {
    "name": "Sahil Balik Evi",
    "cuisine": "Deniz Urunleri",
    "area": "Sahil",
    "district": "Sahil",
    "rating": 4.5,
    "price_level": 2,
    "calories_min": 400,
    "calories_max": 700,
    "description": "Tuzla sahilinde taze balik ve deniz urunleri. Gunluk avlanan baliklar, meze cesitleri.",
    "tags": [
      "balik",
      "deniz urunleri",
      "meze",
      "sahil",
      "taze"
    ],
    "address": "Sahil Mah. Liman Cad. No:34, Tuzla, Istanbul",
    "phone": "0216 395 30 03",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Hamsi Tava",
        "emoji": "🐟"
      },
      {
        "name": "Acili Ezme",
        "emoji": "🌶️"
      },
      {
        "name": "Humus",
        "emoji": "🫘"
      }
    ]
  },
  {
    "name": "Kokorec Express Tuzla",
    "cuisine": "Turkish",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4,
    "price_level": 1,
    "calories_min": 350,
    "calories_max": 600,
    "description": "Gevrek ekmek arasinda ya da porsiyon kokorec, baharatli ve lezzetli sokak yemegi.",
    "tags": [
      "kokorec",
      "sokak yemegi",
      "gece",
      "ogrenci"
    ],
    "address": "Merkez Mah. Cumhuriyet Cad. No:8, Tuzla, Istanbul",
    "phone": "0216 395 40 04",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "02:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Porsiyon Kokorec",
        "emoji": "🍽️"
      },
      {
        "name": "Baharatli Kokorec",
        "emoji": "🌶️"
      },
      {
        "name": "Bibimbap",
        "emoji": "🍚"
      }
    ]
  },
  {
    "name": "Pizza Lazza Tuzla",
    "cuisine": "Italian",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 4.2,
    "price_level": 1,
    "calories_min": 600,
    "calories_max": 1000,
    "description": "Ogrenci dostu fiyatlarla ince hamur ve kalin hamur pizza cesitleri, makarna ve salata.",
    "tags": [
      "pizza",
      "makarna",
      "italyan",
      "ogrenci"
    ],
    "address": "Universite Mah. Ogrenci Sok. No:3, Tuzla, Istanbul",
    "phone": "0216 395 50 05",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Spaghetti Bolognese",
        "emoji": "🍝"
      },
      {
        "name": "Margherita",
        "emoji": "🍕"
      },
      {
        "name": "Tiramisu",
        "emoji": "🍰"
      }
    ]
  },
  {
    "name": "Burger Lab Tuzla",
    "cuisine": "American",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.4,
    "price_level": 2,
    "calories_min": 650,
    "calories_max": 1100,
    "description": "El yapimi burger cesitleri, ozel soslar ve cıtır patates. Gurme burger deneyimi.",
    "tags": [
      "burger",
      "amerikan",
      "fast food",
      "patates"
    ],
    "address": "Merkez Mah. Ataturk Cad. No:45, Tuzla, Istanbul",
    "phone": "0216 395 60 06",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "01:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Truffle Fries",
        "emoji": "🍟"
      },
      {
        "name": "Milkshake",
        "emoji": "🥤"
      },
      {
        "name": "BBQ Burger",
        "emoji": "🔥"
      }
    ]
  },
  {
    "name": "Aydinli Kahvalti Bahcesi",
    "cuisine": "Cafe/Kahvalti",
    "area": "Aydınlı",
    "district": "Aydınlı",
    "rating": 4.6,
    "price_level": 2,
    "calories_min": 500,
    "calories_max": 900,
    "description": "Serpme kahvalti, menemen, gozleme ve taze sikilmis meyve sulari ile guzel bir sabah.",
    "tags": [
      "kahvalti",
      "serpme",
      "gozleme",
      "menemen",
      "bahce"
    ],
    "address": "Aydinli Mah. Bahce Sok. No:7, Tuzla, Istanbul",
    "phone": "0216 395 70 07",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      }
    ],
    "available_hours": {
      "open": "07:00",
      "close": "15:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Kiymali Gozleme",
        "emoji": "🥩"
      },
      {
        "name": "Serpme Kahvalti",
        "emoji": "🍳"
      },
      {
        "name": "Latte",
        "emoji": "☕"
      }
    ]
  },
  {
    "name": "Asia Wok Tuzla",
    "cuisine": "Asian",
    "area": "İçmeler",
    "district": "Icmeler",
    "rating": 4.1,
    "price_level": 2,
    "calories_min": 400,
    "calories_max": 700,
    "description": "Noodle, wok, sushi ve Uzakdogu lezzetleri. Taze malzemelerle hazirlanan Asya mutfagi.",
    "tags": [
      "asya",
      "noodle",
      "wok",
      "sushi",
      "uzakdogu"
    ],
    "address": "Icmeler Mah. Deniz Cad. No:22, Tuzla, Istanbul",
    "phone": "0216 395 80 08",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:30",
      "close": "22:30",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Dragon Roll",
        "emoji": "🐉"
      },
      {
        "name": "Somon Nigiri",
        "emoji": "🍣"
      },
      {
        "name": "Miso Corbasi",
        "emoji": "🍜"
      }
    ]
  },
  {
    "name": "Postane Tatlicisi",
    "cuisine": "Tatlici",
    "area": "Postane",
    "district": "Postane",
    "rating": 4.3,
    "price_level": 1,
    "calories_min": 200,
    "calories_max": 500,
    "description": "Kunefe, baklava, sutlac ve kazandibi gibi geleneksel Turk tatliları.",
    "tags": [
      "tatli",
      "kunefe",
      "baklava",
      "sutlac",
      "geleneksel"
    ],
    "address": "Postane Mah. Istasyon Cad. No:15, Tuzla, Istanbul",
    "phone": "0216 395 90 09",
    "competition_slots": [
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Kunefe",
        "emoji": "🧀"
      },
      {
        "name": "Sutlac",
        "emoji": "🍮"
      },
      {
        "name": "Sutlu Nuriye",
        "emoji": "🍯"
      }
    ]
  },
  {
    "name": "Ev Lezzetleri Tuzla",
    "cuisine": "Ev Yemekleri",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.4,
    "price_level": 1,
    "calories_min": 400,
    "calories_max": 700,
    "description": "Her gun degisen menu ile ev yapimi yemekler. Kuru fasulye, etli nohut, dolma ve daha fazlasi.",
    "tags": [
      "ev yemegi",
      "tabldot",
      "anne yemegi",
      "ogrenci",
      "ekonomik"
    ],
    "address": "Merkez Mah. Pazar Sok. No:20, Tuzla, Istanbul",
    "phone": "0216 396 10 10",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:30",
      "close": "21:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Pilav",
        "emoji": "🍚"
      },
      {
        "name": "Kuru Fasulye",
        "emoji": "🫘"
      },
      {
        "name": "Mercimek Corbasi",
        "emoji": "🍲"
      }
    ]
  },
  {
    "name": "Orhanli Kebap",
    "cuisine": "Turkish",
    "area": "Orhanlı",
    "district": "Orhanlı",
    "rating": 4.5,
    "price_level": 2,
    "calories_min": 550,
    "calories_max": 900,
    "description": "Adana, Urfa, beyti ve patlican kebabi. Odun atesinde pisirilmis lezzetli kebaplar.",
    "tags": [
      "kebap",
      "adana",
      "urfa",
      "mangal",
      "odun atesi"
    ],
    "address": "Orhanli Mah. Sanayi Cad. No:18, Tuzla, Istanbul",
    "phone": "0216 396 20 11",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:30",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Urfa Kebap",
        "emoji": "🥩"
      },
      {
        "name": "Adana Kebap",
        "emoji": "🔥"
      },
      {
        "name": "Ali Nazik",
        "emoji": "🍖"
      }
    ]
  },
  {
    "name": "Kampus Cafe & Bistro",
    "cuisine": "Cafe/Kahvalti",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 4,
    "price_level": 1,
    "calories_min": 250,
    "calories_max": 500,
    "description": "Kahve cesitleri, tost, sandvic ve hafif atistirmaliklar. Ders calismak icin ideal.",
    "tags": [
      "cafe",
      "kahve",
      "tost",
      "sandvic",
      "ogrenci",
      "calisma"
    ],
    "address": "Universite Mah. Kampus Sok. No:1, Tuzla, Istanbul",
    "phone": "0216 396 30 12",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      }
    ],
    "available_hours": {
      "open": "07:30",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Cheesecake",
        "emoji": "🍰"
      },
      {
        "name": "Croissant",
        "emoji": "🥐"
      },
      {
        "name": "Karisik Tost",
        "emoji": "🥪"
      }
    ]
  },
  {
    "name": "Tuzla Cigkofte",
    "cuisine": "Fast Food",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.2,
    "price_level": 1,
    "calories_min": 250,
    "calories_max": 450,
    "description": "Acili ve acisiz cigkofte durum, lavasin icinde nar eksili lezzet.",
    "tags": [
      "cigkofte",
      "durum",
      "vegan",
      "hafif",
      "ogrenci"
    ],
    "address": "Merkez Mah. Halk Cad. No:9, Tuzla, Istanbul",
    "phone": "0216 396 40 13",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Falafel Wrap",
        "emoji": "🌯"
      },
      {
        "name": "Vegan Burger",
        "emoji": "🍔"
      },
      {
        "name": "Izgara Kofte",
        "emoji": "🍖"
      }
    ]
  },
  {
    "name": "Sahil Midye Tava",
    "cuisine": "Deniz Urunleri",
    "area": "Sahil",
    "district": "Sahil",
    "rating": 4,
    "price_level": 1,
    "calories_min": 300,
    "calories_max": 550,
    "description": "Midye tava, midye dolma ve balik ekmek. Tuzla sahilinin vazgecilmez lezzeti.",
    "tags": [
      "midye",
      "balik ekmek",
      "sokak yemegi",
      "sahil",
      "deniz"
    ],
    "address": "Sahil Mah. Iskele Cad. No:5, Tuzla, Istanbul",
    "phone": "0216 396 50 14",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Hamsi Tava",
        "emoji": "🐟"
      },
      {
        "name": "Balik Ekmek",
        "emoji": "🥖"
      },
      {
        "name": "Balik Izgara",
        "emoji": "🐟"
      }
    ]
  },
  {
    "name": "Icmeler Lahmacun",
    "cuisine": "Turkish",
    "area": "İçmeler",
    "district": "Icmeler",
    "rating": 4.3,
    "price_level": 1,
    "calories_min": 300,
    "calories_max": 500,
    "description": "Ince hamurlu lahmacun, etli ekmek ve ayran. Hizli ve doyurucu ogle yemegi.",
    "tags": [
      "lahmacun",
      "etli ekmek",
      "ayran",
      "hizli",
      "ogrenci"
    ],
    "address": "Icmeler Mah. Orman Yolu Cad. No:11, Tuzla, Istanbul",
    "phone": "0216 396 60 15",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:30",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Ayran",
        "emoji": "🥛"
      },
      {
        "name": "Lahmacun",
        "emoji": "🫓"
      },
      {
        "name": "Findik Lahmacun",
        "emoji": "🥜"
      }
    ]
  },
  {
    "name": "Waffle House Tuzla",
    "cuisine": "Tatlici",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 3.9,
    "price_level": 1,
    "calories_min": 350,
    "calories_max": 650,
    "description": "Cikolatali, meyveli ve karamelli waffle cesitleri. Ogrencilerin tatli molasi.",
    "tags": [
      "waffle",
      "tatli",
      "cikolata",
      "ogrenci",
      "meyve"
    ],
    "address": "Universite Mah. Park Sok. No:6, Tuzla, Istanbul",
    "phone": "0216 396 70 16",
    "competition_slots": [
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "12:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Baklava",
        "emoji": "🍯"
      },
      {
        "name": "Cikolatali Waffle",
        "emoji": "🧇"
      },
      {
        "name": "Dondurma",
        "emoji": "🍦"
      }
    ]
  },
  {
    "name": "Aydinli Tantuni",
    "cuisine": "Fast Food",
    "area": "Aydınlı",
    "district": "Aydınlı",
    "rating": 4.1,
    "price_level": 1,
    "calories_min": 400,
    "calories_max": 650,
    "description": "Mersin usulu tantuni, durum ve porsiyon secenekleri. Baharatlı ve lezzetli.",
    "tags": [
      "tantuni",
      "mersin",
      "durum",
      "baharatli",
      "hizli"
    ],
    "address": "Aydinli Mah. Cinar Cad. No:14, Tuzla, Istanbul",
    "phone": "0216 396 80 17",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "01:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Et Tantuni",
        "emoji": "🌯"
      },
      {
        "name": "Tavuk Tantuni",
        "emoji": "🐔"
      },
      {
        "name": "Acili Tantuni",
        "emoji": "🌶️"
      }
    ]
  },
  {
    "name": "Postane Borek Evi",
    "cuisine": "Turkish",
    "area": "Postane",
    "district": "Postane",
    "rating": 4.2,
    "price_level": 1,
    "calories_min": 300,
    "calories_max": 550,
    "description": "Su boregi, sigara boregi, acma ve pogaca. Sabah kahvaltisi icin ideal secenek.",
    "tags": [
      "borek",
      "pogaca",
      "kahvalti",
      "hamur isi",
      "geleneksel"
    ],
    "address": "Postane Mah. Okul Cad. No:3, Tuzla, Istanbul",
    "phone": "0216 396 90 18",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      }
    ],
    "available_hours": {
      "open": "06:30",
      "close": "17:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Serpme Kahvalti",
        "emoji": "🍳"
      },
      {
        "name": "Etli Ekmek",
        "emoji": "🫓"
      },
      {
        "name": "Menemen",
        "emoji": "🥚"
      }
    ]
  },
  {
    "name": "Orhanli Cag Kebabi",
    "cuisine": "Turkish",
    "area": "Orhanlı",
    "district": "Orhanlı",
    "rating": 4.4,
    "price_level": 1,
    "calories_min": 500,
    "calories_max": 850,
    "description": "Erzurum usulu cag kebabi, lavasa sarili et cesitleri ve yogurtlu kebap.",
    "tags": [
      "cag kebabi",
      "erzurum",
      "kebap",
      "et",
      "lavas"
    ],
    "address": "Orhanli Mah. Fabrika Yolu No:25, Tuzla, Istanbul",
    "phone": "0216 397 10 19",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Adana Kebap",
        "emoji": "🔥"
      },
      {
        "name": "Ali Nazik",
        "emoji": "🍖"
      },
      {
        "name": "Beyti Sarma",
        "emoji": "🌯"
      }
    ]
  },
  {
    "name": "Kampus Tost & Kumru",
    "cuisine": "Fast Food",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 3.8,
    "price_level": 1,
    "calories_min": 350,
    "calories_max": 600,
    "description": "Kasarli tost, kumru ve ayran. Ogrenci butcesine en uygun atistirmalik.",
    "tags": [
      "tost",
      "kumru",
      "kasar",
      "ogrenci",
      "ekonomik"
    ],
    "address": "Universite Mah. Yurt Sok. No:2, Tuzla, Istanbul",
    "phone": "0216 397 20 20",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "07:00",
      "close": "02:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Karisik Tost",
        "emoji": "🥪"
      },
      {
        "name": "Kumru",
        "emoji": "🌭"
      },
      {
        "name": "Ayran",
        "emoji": "🥛"
      }
    ]
  },
  {
    "name": "Tuzla Balikcilar Dernegi",
    "cuisine": "Deniz Urunleri",
    "area": "Sahil",
    "district": "Sahil",
    "rating": 4.7,
    "price_level": 2,
    "calories_min": 450,
    "calories_max": 800,
    "description": "Gunluk taze balik cesitleri, izgara ve bugulamayla hazirlanan ozenli balik yemekleri.",
    "tags": [
      "balik",
      "izgara",
      "buharlama",
      "taze",
      "deniz",
      "premium"
    ],
    "address": "Sahil Mah. Balikci Barınagi No:1, Tuzla, Istanbul",
    "phone": "0216 397 30 21",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Balik Ekmek",
        "emoji": "🥖"
      },
      {
        "name": "Balik Izgara",
        "emoji": "🐟"
      },
      {
        "name": "Ciupra Tava",
        "emoji": "🍳"
      }
    ]
  },
  {
    "name": "Merkez Corba Dunyasi",
    "cuisine": "Ev Yemekleri",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.3,
    "price_level": 1,
    "calories_min": 200,
    "calories_max": 400,
    "description": "Mercimek, ezogelin, tavuk suyu ve iskembe corbasi. Soguk gunlerde isinmanin en guzel yolu.",
    "tags": [
      "corba",
      "mercimek",
      "iskembe",
      "sicak",
      "ekonomik"
    ],
    "address": "Merkez Mah. Carsı Cad. No:17, Tuzla, Istanbul",
    "phone": "0216 397 40 22",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "06:00",
      "close": "02:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Gunun Tabagi",
        "emoji": "⭐"
      },
      {
        "name": "Ozel Menu",
        "emoji": "🍽️"
      },
      {
        "name": "Chef Special",
        "emoji": "👨‍🍳"
      }
    ]
  },
  {
    "name": "Icmeler Mangal Keyfi",
    "cuisine": "Turkish",
    "area": "İçmeler",
    "district": "Icmeler",
    "rating": 4.3,
    "price_level": 2,
    "calories_min": 550,
    "calories_max": 950,
    "description": "Mangalda kofte, pirzola, tavuk kanat ve sebze izgara. Dogal ortamda mangal keyfi.",
    "tags": [
      "mangal",
      "izgara",
      "kofte",
      "pirzola",
      "doga"
    ],
    "address": "Icmeler Mah. Mesire Alani Yolu No:8, Tuzla, Istanbul",
    "phone": "0216 397 50 23",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Kasarli Kofte",
        "emoji": "🧀"
      },
      {
        "name": "Izgara Kofte",
        "emoji": "🍖"
      },
      {
        "name": "Pilav Ustu",
        "emoji": "🍚"
      }
    ]
  },
  {
    "name": "Mega Chicken Tuzla",
    "cuisine": "Fast Food",
    "area": "Aydınlı",
    "district": "Aydınlı",
    "rating": 3.9,
    "price_level": 1,
    "calories_min": 500,
    "calories_max": 900,
    "description": "Citir tavuk, chicken burger, nugget ve patates kizartmasi. Hizli ve doyurucu.",
    "tags": [
      "tavuk",
      "citir",
      "burger",
      "nugget",
      "fast food"
    ],
    "address": "Aydinli Mah. Ana Cad. No:30, Tuzla, Istanbul",
    "phone": "0216 397 60 24",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "01:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "BBQ Burger",
        "emoji": "🔥"
      },
      {
        "name": "Cheese Burger",
        "emoji": "🧀"
      },
      {
        "name": "Crispy Chicken",
        "emoji": "🍗"
      }
    ]
  },
  {
    "name": "Sahil Cafe",
    "cuisine": "Cafe/Kahvalti",
    "area": "Sahil",
    "district": "Sahil",
    "rating": 4.2,
    "price_level": 2,
    "calories_min": 300,
    "calories_max": 600,
    "description": "Deniz manzarali kahvalti ve ogle yemegi. Taze sikilmis portakal suyu ve ozel kahveler.",
    "tags": [
      "cafe",
      "kahvalti",
      "deniz manzara",
      "kahve",
      "brunch"
    ],
    "address": "Sahil Mah. Sahil Yolu No:12, Tuzla, Istanbul",
    "phone": "0216 397 70 25",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      }
    ],
    "available_hours": {
      "open": "07:00",
      "close": "20:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Menemen",
        "emoji": "🥚"
      },
      {
        "name": "Midye Dolma",
        "emoji": "🐚"
      },
      {
        "name": "Meze Tabagi",
        "emoji": "🍽️"
      }
    ]
  },
  {
    "name": "Postane Kumpir",
    "cuisine": "Fast Food",
    "area": "Postane",
    "district": "Postane",
    "rating": 4,
    "price_level": 1,
    "calories_min": 500,
    "calories_max": 800,
    "description": "Bol malzemeli kumpir cesitleri. Kasar, misir, sosis, zeytin ve daha fazlasi.",
    "tags": [
      "kumpir",
      "patates",
      "sokak yemegi",
      "ogrenci",
      "bol malzeme"
    ],
    "address": "Postane Mah. Ptt Cad. No:8, Tuzla, Istanbul",
    "phone": "0216 397 80 26",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Sosisli Kumpir",
        "emoji": "🌭"
      },
      {
        "name": "Peynirli Kumpir",
        "emoji": "🧀"
      },
      {
        "name": "Karisik Kumpir",
        "emoji": "🥔"
      }
    ]
  },
  {
    "name": "Ramen House Tuzla",
    "cuisine": "Asian",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.3,
    "price_level": 2,
    "calories_min": 400,
    "calories_max": 650,
    "description": "Japon usulu ramen, miso corbasi ve gyoza. Sicak ve doyurucu Asya lezzetleri.",
    "tags": [
      "ramen",
      "japon",
      "miso",
      "gyoza",
      "asya"
    ],
    "address": "Merkez Mah. Yeni Sok. No:28, Tuzla, Istanbul",
    "phone": "0216 397 90 27",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:30",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "California Roll",
        "emoji": "🍣"
      },
      {
        "name": "Sashimi",
        "emoji": "🐟"
      },
      {
        "name": "Edamame",
        "emoji": "🫛"
      }
    ]
  },
  {
    "name": "Orhanli Cigerci",
    "cuisine": "Turkish",
    "area": "Orhanlı",
    "district": "Orhanlı",
    "rating": 4.1,
    "price_level": 1,
    "calories_min": 350,
    "calories_max": 600,
    "description": "Edirne usulu ciger tava, arnavut cigeri ve sogan salatasi. Geleneksel lezzet.",
    "tags": [
      "ciger",
      "edirne",
      "arnavut",
      "tava",
      "geleneksel"
    ],
    "address": "Orhanli Mah. Meydan Sok. No:4, Tuzla, Istanbul",
    "phone": "0216 398 10 28",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "21:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Etli Ekmek",
        "emoji": "🫓"
      },
      {
        "name": "Ton Balikli Salata",
        "emoji": "🐟"
      },
      {
        "name": "Arnavut Cigeri",
        "emoji": "🍖"
      }
    ]
  },
  {
    "name": "Kampus Pizza Evi",
    "cuisine": "Italian",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 4,
    "price_level": 1,
    "calories_min": 550,
    "calories_max": 900,
    "description": "Ekonomik pizza dilim ve bütün pizza secenekleri. Ogrenci menusu mevcut.",
    "tags": [
      "pizza",
      "dilim",
      "ekonomik",
      "italyan",
      "ogrenci"
    ],
    "address": "Universite Mah. Kantil Sok. No:9, Tuzla, Istanbul",
    "phone": "0216 398 20 29",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "01:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Karisik Pizza",
        "emoji": "🍕"
      },
      {
        "name": "Spaghetti Bolognese",
        "emoji": "🍝"
      },
      {
        "name": "Margherita",
        "emoji": "🍕"
      }
    ]
  },
  {
    "name": "Tuzla Kokorecci Usta",
    "cuisine": "Turkish",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.2,
    "price_level": 1,
    "calories_min": 350,
    "calories_max": 600,
    "description": "Yangin gibi kokorec, baharatli ve lezzetli. Gece atistirmaliginin yildizi.",
    "tags": [
      "kokorec",
      "gece",
      "baharatli",
      "sokak yemegi",
      "usta"
    ],
    "address": "Merkez Mah. Gece Sok. No:6, Tuzla, Istanbul",
    "phone": "0216 398 30 30",
    "competition_slots": [
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "16:00",
      "close": "03:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Yarim Ekmek Kokorec",
        "emoji": "🥖"
      },
      {
        "name": "Korean Fried Chicken",
        "emoji": "🍗"
      },
      {
        "name": "Tteokbokki",
        "emoji": "🌶️"
      }
    ]
  },
  {
    "name": "Aydinli Pidecisi Mehmet Usta",
    "cuisine": "Turkish",
    "area": "Aydınlı",
    "district": "Aydınlı",
    "rating": 4.5,
    "price_level": 1,
    "calories_min": 450,
    "calories_max": 750,
    "description": "Kasarli, kiymali, kusbasili pide cesitleri. Taze hamur ve tas firin.",
    "tags": [
      "pide",
      "kiymali",
      "kasarli",
      "tas firin",
      "usta"
    ],
    "address": "Aydinli Mah. Tas Firin Sok. No:2, Tuzla, Istanbul",
    "phone": "0216 398 40 31",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Kusbasili Pide",
        "emoji": "🫓"
      },
      {
        "name": "Karisik Pide",
        "emoji": "🧀"
      },
      {
        "name": "Kiymali Pide",
        "emoji": "🥩"
      }
    ]
  },
  {
    "name": "Smash Burger Tuzla",
    "cuisine": "American",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 4.3,
    "price_level": 2,
    "calories_min": 600,
    "calories_max": 1050,
    "description": "Smash teknigiyle hazirlanan burger, crispy patates ve milkshake cesitleri.",
    "tags": [
      "smash burger",
      "amerikan",
      "milkshake",
      "patates",
      "gurme"
    ],
    "address": "Universite Mah. Lise Cad. No:15, Tuzla, Istanbul",
    "phone": "0216 398 50 32",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "00:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Truffle Fries",
        "emoji": "🍟"
      },
      {
        "name": "Milkshake",
        "emoji": "🥤"
      },
      {
        "name": "BBQ Burger",
        "emoji": "🔥"
      }
    ]
  },
  {
    "name": "Icmeler Gozleme Evi",
    "cuisine": "Turkish",
    "area": "İçmeler",
    "district": "Icmeler",
    "rating": 4.1,
    "price_level": 1,
    "calories_min": 300,
    "calories_max": 500,
    "description": "Koyde yapilmis gibi gozleme cesitleri. Peynirli, patatesli, ispanakli ve kiymali.",
    "tags": [
      "gozleme",
      "koy",
      "peynirli",
      "geleneksel",
      "ev yapimi"
    ],
    "address": "Icmeler Mah. Koy Yolu No:6, Tuzla, Istanbul",
    "phone": "0216 398 60 33",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      }
    ],
    "available_hours": {
      "open": "07:00",
      "close": "18:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Ayran",
        "emoji": "🥛"
      },
      {
        "name": "Peynirli Gozleme",
        "emoji": "🧀"
      },
      {
        "name": "Patatesli Gozleme",
        "emoji": "🥔"
      }
    ]
  },
  {
    "name": "Sahil Dondurma",
    "cuisine": "Tatlici",
    "area": "Sahil",
    "district": "Sahil",
    "rating": 4.4,
    "price_level": 1,
    "calories_min": 150,
    "calories_max": 350,
    "description": "Maras usulu dondurma, kulahta ve kasede. Antep fistikli, cikolatali, meyveli cesitler.",
    "tags": [
      "dondurma",
      "maras",
      "tatli",
      "sahil",
      "serinletici"
    ],
    "address": "Sahil Mah. Yuruyus Yolu No:9, Tuzla, Istanbul",
    "phone": "0216 398 70 34",
    "competition_slots": [
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Baklava",
        "emoji": "🍯"
      },
      {
        "name": "Cikolatali",
        "emoji": "🍫"
      },
      {
        "name": "Kunefe",
        "emoji": "🧀"
      }
    ]
  },
  {
    "name": "Tuzla Mantievi",
    "cuisine": "Ev Yemekleri",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.5,
    "price_level": 1,
    "calories_min": 350,
    "calories_max": 600,
    "description": "El yapimi Kayseri mantisi, yogurtlu ve soslu. Anne eli degmis gibi lezzetli.",
    "tags": [
      "manti",
      "kayseri",
      "yogurt",
      "ev yapimi",
      "geleneksel"
    ],
    "address": "Merkez Mah. Kayseri Sok. No:11, Tuzla, Istanbul",
    "phone": "0216 398 80 35",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "21:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Kayseri Mantisi",
        "emoji": "🥟"
      },
      {
        "name": "Yogurtlu Manti",
        "emoji": "🥛"
      },
      {
        "name": "Su Boregi",
        "emoji": "🫓"
      }
    ]
  },
  {
    "name": "Orhanli Tavukcu",
    "cuisine": "Fast Food",
    "area": "Orhanlı",
    "district": "Orhanlı",
    "rating": 3.9,
    "price_level": 1,
    "calories_min": 450,
    "calories_max": 800,
    "description": "Tavuk sis, tavuk doner, tavuk burger. Her cesit tavuk yemegi tek catı altinda.",
    "tags": [
      "tavuk",
      "sis",
      "doner",
      "ekonomik",
      "hizli"
    ],
    "address": "Orhanli Mah. Isci Cad. No:12, Tuzla, Istanbul",
    "phone": "0216 398 90 36",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Iskender",
        "emoji": "🍖"
      },
      {
        "name": "Porsiyon Doner",
        "emoji": "🍽️"
      },
      {
        "name": "BBQ Burger",
        "emoji": "🔥"
      }
    ]
  },
  {
    "name": "Postane Simit Sarayi",
    "cuisine": "Cafe/Kahvalti",
    "area": "Postane",
    "district": "Postane",
    "rating": 4,
    "price_level": 1,
    "calories_min": 200,
    "calories_max": 450,
    "description": "Taze simit, pogaca, acma ve cay. Sabah kahvaltisi icin en pratik durak.",
    "tags": [
      "simit",
      "pogaca",
      "cay",
      "kahvalti",
      "pratik"
    ],
    "address": "Postane Mah. Belediye Cad. No:5, Tuzla, Istanbul",
    "phone": "0216 399 10 37",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      }
    ],
    "available_hours": {
      "open": "06:00",
      "close": "20:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Pogaca",
        "emoji": "🥐"
      },
      {
        "name": "Brownie",
        "emoji": "🍫"
      },
      {
        "name": "Cay",
        "emoji": "🍵"
      }
    ]
  },
  {
    "name": "Thai Box Tuzla",
    "cuisine": "Asian",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 4,
    "price_level": 1,
    "calories_min": 380,
    "calories_max": 650,
    "description": "Thai yemekleri kutu serviste. Pad Thai, fried rice ve curry cesitleri.",
    "tags": [
      "thai",
      "pad thai",
      "curry",
      "kutu",
      "asya"
    ],
    "address": "Universite Mah. Yemekhane Sok. No:7, Tuzla, Istanbul",
    "phone": "0216 399 20 38",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Ozel Menu",
        "emoji": "🍽️"
      },
      {
        "name": "Chef Special",
        "emoji": "👨‍🍳"
      },
      {
        "name": "Gunun Tabagi",
        "emoji": "⭐"
      }
    ]
  },
  {
    "name": "Merkez Kanatci",
    "cuisine": "Fast Food",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.1,
    "price_level": 1,
    "calories_min": 500,
    "calories_max": 850,
    "description": "Acili, BBQ soslu ve ranch soslu tavuk kanat cesitleri. Yaninda patates ve coleslaw.",
    "tags": [
      "kanat",
      "tavuk",
      "acili",
      "bbq",
      "fast food"
    ],
    "address": "Merkez Mah. Liman Sok. No:19, Tuzla, Istanbul",
    "phone": "0216 399 30 39",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "01:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Pulled Pork",
        "emoji": "🍖"
      },
      {
        "name": "Brisket",
        "emoji": "🥩"
      },
      {
        "name": "Coleslaw",
        "emoji": "🥗"
      }
    ]
  },
  {
    "name": "Aydinli Balik Lokantasi",
    "cuisine": "Deniz Urunleri",
    "area": "Aydınlı",
    "district": "Aydınlı",
    "rating": 4.3,
    "price_level": 2,
    "calories_min": 400,
    "calories_max": 700,
    "description": "Uygun fiyatli balik tabagi, karides tava ve kalamar. Aile ortaminda balik keyfi.",
    "tags": [
      "balik",
      "karides",
      "kalamar",
      "lokanta",
      "aile"
    ],
    "address": "Aydinli Mah. Pazar Yeri Sok. No:16, Tuzla, Istanbul",
    "phone": "0216 399 40 40",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Balik Ekmek",
        "emoji": "🥖"
      },
      {
        "name": "Balik Izgara",
        "emoji": "🐟"
      },
      {
        "name": "Ciupra Tava",
        "emoji": "🍳"
      }
    ]
  },
  {
    "name": "Icmeler Kahve Duragi",
    "cuisine": "Cafe/Kahvalti",
    "area": "İçmeler",
    "district": "Icmeler",
    "rating": 4.2,
    "price_level": 1,
    "calories_min": 200,
    "calories_max": 400,
    "description": "Filtre kahve, espresso, turk kahvesi ve yaninda kurabiye. Huzurlu bir mola.",
    "tags": [
      "kahve",
      "espresso",
      "turk kahvesi",
      "mola",
      "sakin"
    ],
    "address": "Icmeler Mah. Cami Sok. No:3, Tuzla, Istanbul",
    "phone": "0216 399 50 41",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      }
    ],
    "available_hours": {
      "open": "07:00",
      "close": "21:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Gozleme",
        "emoji": "🫓"
      },
      {
        "name": "Avocado Toast",
        "emoji": "🥑"
      },
      {
        "name": "Brownie",
        "emoji": "🍫"
      }
    ]
  },
  {
    "name": "Sahil Kofte Evi",
    "cuisine": "Turkish",
    "area": "Sahil",
    "district": "Sahil",
    "rating": 4.1,
    "price_level": 1,
    "calories_min": 400,
    "calories_max": 650,
    "description": "Izgara kofte, kasarli kofte, kofte ekmek. Yaninda pilav ve salata.",
    "tags": [
      "kofte",
      "izgara",
      "pilav",
      "ekmek arasi",
      "ekonomik"
    ],
    "address": "Sahil Mah. Park Cad. No:7, Tuzla, Istanbul",
    "phone": "0216 399 60 42",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Ton Balikli Salata",
        "emoji": "🐟"
      },
      {
        "name": "Izgara Kofte",
        "emoji": "🍖"
      },
      {
        "name": "Pilav Ustu",
        "emoji": "🍚"
      }
    ]
  },
  {
    "name": "Tuzla Dondurma & Tatli",
    "cuisine": "Tatlici",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.2,
    "price_level": 1,
    "calories_min": 200,
    "calories_max": 450,
    "description": "Profiterol, supangle, trilece ve dondurma cesitleri. Yemek sonrasi tatli keyfi.",
    "tags": [
      "tatli",
      "profiterol",
      "trilece",
      "dondurma",
      "supangle"
    ],
    "address": "Merkez Mah. Ticaret Sok. No:23, Tuzla, Istanbul",
    "phone": "0216 399 70 43",
    "competition_slots": [
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Cikolatali",
        "emoji": "🍫"
      },
      {
        "name": "Kunefe",
        "emoji": "🧀"
      },
      {
        "name": "Sutlac",
        "emoji": "🍮"
      }
    ]
  },
  {
    "name": "Orhanli Ev Yemekleri",
    "cuisine": "Ev Yemekleri",
    "area": "Orhanlı",
    "district": "Orhanlı",
    "rating": 4.3,
    "price_level": 1,
    "calories_min": 400,
    "calories_max": 700,
    "description": "Gunluk menu ile sicak ev yemekleri. Etli sebze, pilav, corba ve salata.",
    "tags": [
      "ev yemegi",
      "gunluk menu",
      "tabldot",
      "sicak",
      "anne eli"
    ],
    "address": "Orhanli Mah. Esnaf Cad. No:9, Tuzla, Istanbul",
    "phone": "0216 399 80 44",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "20:30",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Pilav",
        "emoji": "🍚"
      },
      {
        "name": "Caesar Salata",
        "emoji": "🥗"
      },
      {
        "name": "Kuru Fasulye",
        "emoji": "🫘"
      }
    ]
  },
  {
    "name": "Kampus Wrap & Roll",
    "cuisine": "Fast Food",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 3.9,
    "price_level": 1,
    "calories_min": 350,
    "calories_max": 600,
    "description": "Tavuklu, etli ve falafel wrap cesitleri. Hizli ve saglikli ogle yemegi alternatifi.",
    "tags": [
      "wrap",
      "falafel",
      "tavuk",
      "saglikli",
      "hizli"
    ],
    "address": "Universite Mah. Kutuphane Sok. No:4, Tuzla, Istanbul",
    "phone": "0216 399 90 45",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      }
    ],
    "available_hours": {
      "open": "09:00",
      "close": "20:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Quinoa Bowl",
        "emoji": "🥗"
      },
      {
        "name": "Smoothie Bowl",
        "emoji": "🫐"
      },
      {
        "name": "Falafel Wrap",
        "emoji": "🌯"
      }
    ]
  },
  {
    "name": "Postane Kebap Salonu",
    "cuisine": "Turkish",
    "area": "Postane",
    "district": "Postane",
    "rating": 4.4,
    "price_level": 2,
    "calories_min": 550,
    "calories_max": 900,
    "description": "Adana kebap, iskender, Ali Nazik ve karisik izgara. Geleneksel kebap sofrasi.",
    "tags": [
      "kebap",
      "iskender",
      "ali nazik",
      "izgara",
      "geleneksel"
    ],
    "address": "Postane Mah. Devlet Yolu Cad. No:22, Tuzla, Istanbul",
    "phone": "0216 400 10 46",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:30",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Urfa Kebap",
        "emoji": "🥩"
      },
      {
        "name": "Adana Kebap",
        "emoji": "🔥"
      },
      {
        "name": "Ali Nazik",
        "emoji": "🍖"
      }
    ]
  },
  {
    "name": "Tuzla Baklava & Kunefe",
    "cuisine": "Tatlici",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.6,
    "price_level": 2,
    "calories_min": 300,
    "calories_max": 550,
    "description": "Gaziantep usulu baklava, fistikli kunefe ve katmer. Turk tatlisinin en iyileri.",
    "tags": [
      "baklava",
      "kunefe",
      "katmer",
      "gaziantep",
      "fistik"
    ],
    "address": "Merkez Mah. Tatli Sok. No:13, Tuzla, Istanbul",
    "phone": "0216 400 20 47",
    "competition_slots": [
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Baklava",
        "emoji": "🍯"
      },
      {
        "name": "Cevizli Baklava",
        "emoji": "🌰"
      },
      {
        "name": "Kunefe",
        "emoji": "🧀"
      }
    ]
  },
  {
    "name": "Icmeler Kebap Evi",
    "cuisine": "Turkish",
    "area": "İçmeler",
    "district": "Icmeler",
    "rating": 4.2,
    "price_level": 2,
    "calories_min": 500,
    "calories_max": 850,
    "description": "Kusbasi, sis kebap ve Antep usulu lahmacun. Odun atesinde geleneksel pisirim.",
    "tags": [
      "kebap",
      "kusbasi",
      "sis",
      "lahmacun",
      "odun atesi"
    ],
    "address": "Icmeler Mah. Tepe Cad. No:18, Tuzla, Istanbul",
    "phone": "0216 400 30 48",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:30",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Beyti Sarma",
        "emoji": "🌯"
      },
      {
        "name": "Iskender",
        "emoji": "🍖"
      },
      {
        "name": "Patlican Kebap",
        "emoji": "🍆"
      }
    ]
  },
  {
    "name": "Aydinli Pasta & Borek",
    "cuisine": "Cafe/Kahvalti",
    "area": "Aydınlı",
    "district": "Aydınlı",
    "rating": 4.1,
    "price_level": 1,
    "calories_min": 250,
    "calories_max": 500,
    "description": "Taze pasta cesitleri, borek ve pogaca. Cay esliginde kahvalti molasi.",
    "tags": [
      "pasta",
      "borek",
      "pogaca",
      "cay",
      "pastane"
    ],
    "address": "Aydinli Mah. Okul Cad. No:5, Tuzla, Istanbul",
    "phone": "0216 400 40 49",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      }
    ],
    "available_hours": {
      "open": "06:30",
      "close": "20:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Brownie",
        "emoji": "🍫"
      },
      {
        "name": "Serpme Kahvalti",
        "emoji": "🍳"
      },
      {
        "name": "Latte",
        "emoji": "☕"
      }
    ]
  },
  {
    "name": "Sahil Burger Point",
    "cuisine": "American",
    "area": "Sahil",
    "district": "Sahil",
    "rating": 4,
    "price_level": 1,
    "calories_min": 550,
    "calories_max": 950,
    "description": "Klasik burger, cheese burger ve ozel sos cesitleri. Sahilde burger keyfi.",
    "tags": [
      "burger",
      "cheese",
      "sahil",
      "amerikan",
      "ekonomik"
    ],
    "address": "Sahil Mah. Marina Sok. No:4, Tuzla, Istanbul",
    "phone": "0216 400 50 50",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "00:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "BBQ Burger",
        "emoji": "🔥"
      },
      {
        "name": "Cheese Burger",
        "emoji": "🧀"
      },
      {
        "name": "Crispy Chicken",
        "emoji": "🍗"
      }
    ]
  },
  {
    "name": "Kampus Corba & Pilav",
    "cuisine": "Ev Yemekleri",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 4.2,
    "price_level": 1,
    "calories_min": 300,
    "calories_max": 550,
    "description": "Corba, nohutlu pilav ve tavuk gogsu. Ogrencinin karnını doyuran ekonomik menu.",
    "tags": [
      "corba",
      "pilav",
      "nohut",
      "ogrenci",
      "ekonomik"
    ],
    "address": "Universite Mah. Yurt Cad. No:11, Tuzla, Istanbul",
    "phone": "0216 400 60 51",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "21:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Chef Special",
        "emoji": "👨‍🍳"
      },
      {
        "name": "Gunun Tabagi",
        "emoji": "⭐"
      },
      {
        "name": "Ozel Menu",
        "emoji": "🍽️"
      }
    ]
  },
  {
    "name": "Dragon Wok",
    "cuisine": "Asian",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4,
    "price_level": 2,
    "calories_min": 400,
    "calories_max": 700,
    "description": "Cin ve Uzakdogu mutfagindan wok, spring roll ve dumpling cesitleri.",
    "tags": [
      "cin",
      "wok",
      "spring roll",
      "dumpling",
      "asya"
    ],
    "address": "Merkez Mah. Ticaret Cad. No:35, Tuzla, Istanbul",
    "phone": "0216 400 70 52",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:30",
      "close": "22:30",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Gunun Tabagi",
        "emoji": "⭐"
      },
      {
        "name": "Ozel Menu",
        "emoji": "🍽️"
      },
      {
        "name": "Chef Special",
        "emoji": "👨‍🍳"
      }
    ]
  },
  {
    "name": "Orhanli Pizza & Pasta",
    "cuisine": "Italian",
    "area": "Orhanlı",
    "district": "Orhanlı",
    "rating": 4.1,
    "price_level": 1,
    "calories_min": 500,
    "calories_max": 900,
    "description": "Ince hamur pizza, fettuccine, penne ve ozel soslu makarna cesitleri.",
    "tags": [
      "pizza",
      "pasta",
      "makarna",
      "italyan",
      "ekonomik"
    ],
    "address": "Orhanli Mah. Okul Sok. No:14, Tuzla, Istanbul",
    "phone": "0216 400 80 53",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Pepperoni Pizza",
        "emoji": "🍕"
      },
      {
        "name": "Penne Arrabbiata",
        "emoji": "🍝"
      },
      {
        "name": "Bruschetta",
        "emoji": "🥖"
      }
    ]
  },
  {
    "name": "Tuzla Kahvalti Sofrasi",
    "cuisine": "Cafe/Kahvalti",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.5,
    "price_level": 2,
    "calories_min": 500,
    "calories_max": 900,
    "description": "Zengin serpme kahvalti, sahanda yumurta, sucuklu yumurta ve taze peynir cesitleri.",
    "tags": [
      "kahvalti",
      "serpme",
      "sahanda",
      "sucuk",
      "peynir"
    ],
    "address": "Merkez Mah. Bahce Cad. No:31, Tuzla, Istanbul",
    "phone": "0216 400 90 54",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      }
    ],
    "available_hours": {
      "open": "07:00",
      "close": "16:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Brownie",
        "emoji": "🍫"
      },
      {
        "name": "Serpme Kahvalti",
        "emoji": "🍳"
      },
      {
        "name": "Latte",
        "emoji": "☕"
      }
    ]
  },
  {
    "name": "Aydinli Doner Dunyasi",
    "cuisine": "Turkish",
    "area": "Aydınlı",
    "district": "Aydınlı",
    "rating": 4,
    "price_level": 1,
    "calories_min": 450,
    "calories_max": 750,
    "description": "Et doner, tavuk doner, iskender. Porsiyon ve durum secenekleri ile hizli servis.",
    "tags": [
      "doner",
      "iskender",
      "durum",
      "et",
      "tavuk"
    ],
    "address": "Aydinli Mah. Sanayi Yolu No:20, Tuzla, Istanbul",
    "phone": "0216 401 10 55",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "23:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Iskender",
        "emoji": "🍖"
      },
      {
        "name": "Porsiyon Doner",
        "emoji": "🍽️"
      },
      {
        "name": "Yaprak Doner",
        "emoji": "🥩"
      }
    ]
  },
  {
    "name": "Postane Cig Kofte & Durum",
    "cuisine": "Fast Food",
    "area": "Postane",
    "district": "Postane",
    "rating": 4.1,
    "price_level": 1,
    "calories_min": 250,
    "calories_max": 450,
    "description": "Nar eksili cigkofte, durum ve lavas cesitleri. Hafif ve lezzetli atistirmalik.",
    "tags": [
      "cigkofte",
      "durum",
      "nar eksi",
      "hafif",
      "vegan"
    ],
    "address": "Postane Mah. Carsi Sok. No:10, Tuzla, Istanbul",
    "phone": "0216 401 20 56",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Kasarli Kofte",
        "emoji": "🧀"
      },
      {
        "name": "Durum Cig Kofte",
        "emoji": "🌯"
      },
      {
        "name": "Salgam Suyu",
        "emoji": "🥤"
      }
    ]
  },
  {
    "name": "Sahil Pasta Cafe",
    "cuisine": "Tatlici",
    "area": "Sahil",
    "district": "Sahil",
    "rating": 4.3,
    "price_level": 2,
    "calories_min": 250,
    "calories_max": 500,
    "description": "El yapimi pasta, cheesecake, tiramisu ve brownie. Kahve esliginde tatli keyfi.",
    "tags": [
      "pasta",
      "cheesecake",
      "tiramisu",
      "brownie",
      "cafe"
    ],
    "address": "Sahil Mah. Deniz Sok. No:16, Tuzla, Istanbul",
    "phone": "0216 401 30 57",
    "competition_slots": [
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:30",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Avocado Toast",
        "emoji": "🥑"
      },
      {
        "name": "Brownie",
        "emoji": "🍫"
      },
      {
        "name": "Baklava",
        "emoji": "🍯"
      }
    ]
  },
  {
    "name": "Kampus Doner & Kebap",
    "cuisine": "Turkish",
    "area": "Kampüs Çevresi",
    "district": "Kampüs Çevresi",
    "rating": 4.2,
    "price_level": 1,
    "calories_min": 500,
    "calories_max": 850,
    "description": "Ogrenci menusu ile doner, kebap ve pide bir arada. Doyurucu ve uygun fiyatli.",
    "tags": [
      "doner",
      "kebap",
      "pide",
      "ogrenci menusu",
      "ekonomik"
    ],
    "address": "Universite Mah. Otopark Sok. No:8, Tuzla, Istanbul",
    "phone": "0216 401 40 58",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Cop Sis",
        "emoji": "🍢"
      },
      {
        "name": "Yaprak Doner",
        "emoji": "🥩"
      },
      {
        "name": "Durum",
        "emoji": "🌯"
      }
    ]
  },
  {
    "name": "Icmeler Karides Evi",
    "cuisine": "Deniz Urunleri",
    "area": "İçmeler",
    "district": "Icmeler",
    "rating": 4.4,
    "price_level": 2,
    "calories_min": 350,
    "calories_max": 650,
    "description": "Karides guvec, karides tava ve karides sote. Deniz urunleri sevenlerin adresi.",
    "tags": [
      "karides",
      "guvec",
      "deniz urunleri",
      "tava",
      "ozel"
    ],
    "address": "Icmeler Mah. Sahil Yolu No:14, Tuzla, Istanbul",
    "phone": "0216 401 50 59",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:30",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Balik Izgara",
        "emoji": "🐟"
      },
      {
        "name": "Karides Guvec",
        "emoji": "🦐"
      },
      {
        "name": "Deniz Mahsulleri",
        "emoji": "🦞"
      }
    ]
  },
  {
    "name": "Tuzla Gece Durumu",
    "cuisine": "Fast Food",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 3.8,
    "price_level": 1,
    "calories_min": 400,
    "calories_max": 700,
    "description": "Gece acikan karninizi doyuran doner durum, kokorec ve tost. Gece kuslarina ozel.",
    "tags": [
      "gece",
      "durum",
      "kokorec",
      "tost",
      "late night"
    ],
    "address": "Merkez Mah. Gece Cad. No:1, Tuzla, Istanbul",
    "phone": "0216 401 60 60",
    "competition_slots": [
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      },
      {
        "slot": "late",
        "start": "22:00",
        "end": "02:00"
      }
    ],
    "available_hours": {
      "open": "18:00",
      "close": "04:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Yarim Ekmek Kokorec",
        "emoji": "🥖"
      },
      {
        "name": "Korean Fried Chicken",
        "emoji": "🍗"
      },
      {
        "name": "Karisik Tost",
        "emoji": "🥪"
      }
    ]
  },
  {
    "name": "Orhanli Izgara",
    "cuisine": "Turkish",
    "area": "Orhanlı",
    "district": "Orhanlı",
    "rating": 4.2,
    "price_level": 2,
    "calories_min": 500,
    "calories_max": 900,
    "description": "Karisik izgara, kofte, pirzola ve tavuk sis. Geleneksel Turk mangal sofrasi.",
    "tags": [
      "izgara",
      "mangal",
      "kofte",
      "pirzola",
      "karisik"
    ],
    "address": "Orhanli Mah. Cami Cad. No:7, Tuzla, Istanbul",
    "phone": "0216 401 70 61",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "11:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Izgara Kofte",
        "emoji": "🍖"
      },
      {
        "name": "Pilav Ustu",
        "emoji": "🍚"
      },
      {
        "name": "Piyaz",
        "emoji": "🥗"
      }
    ]
  },
  {
    "name": "Aydinli Cafe & Brunch",
    "cuisine": "Cafe/Kahvalti",
    "area": "Aydınlı",
    "district": "Aydınlı",
    "rating": 4.3,
    "price_level": 2,
    "calories_min": 400,
    "calories_max": 750,
    "description": "Avokadolu tost, granola kasesi ve ozel kahve cesitleri. Modern brunch deneyimi.",
    "tags": [
      "brunch",
      "avokado",
      "granola",
      "kahve",
      "modern"
    ],
    "address": "Aydinli Mah. Yeni Sok. No:8, Tuzla, Istanbul",
    "phone": "0216 401 80 62",
    "competition_slots": [
      {
        "slot": "breakfast",
        "start": "07:00",
        "end": "10:00"
      },
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      }
    ],
    "available_hours": {
      "open": "08:00",
      "close": "18:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Avocado Toast",
        "emoji": "🥑"
      },
      {
        "name": "Ayran",
        "emoji": "🥛"
      },
      {
        "name": "Brownie",
        "emoji": "🍫"
      }
    ]
  },
  {
    "name": "Sushi Tuzla",
    "cuisine": "Asian",
    "area": "Sahil",
    "district": "Sahil",
    "rating": 4.1,
    "price_level": 2,
    "calories_min": 300,
    "calories_max": 550,
    "description": "Sushi roll cesitleri, sashimi ve edamame. Taze malzemelerle Japon mutfagi.",
    "tags": [
      "sushi",
      "japon",
      "sashimi",
      "roll",
      "taze"
    ],
    "address": "Sahil Mah. Marina Cad. No:20, Tuzla, Istanbul",
    "phone": "0216 401 90 63",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "12:00",
      "close": "22:30",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Gyoza",
        "emoji": "🥟"
      },
      {
        "name": "California Roll",
        "emoji": "🍣"
      },
      {
        "name": "Dragon Roll",
        "emoji": "🐉"
      }
    ]
  },
  {
    "name": "Postane Ev Yemekleri",
    "cuisine": "Ev Yemekleri",
    "area": "Postane",
    "district": "Postane",
    "rating": 4.4,
    "price_level": 1,
    "calories_min": 400,
    "calories_max": 700,
    "description": "Her gun farkli 8 cesit yemek. Zeytinyagli, etli ve sebze yemekleri. Evinizden uzakta eviniz.",
    "tags": [
      "ev yemegi",
      "zeytinyagli",
      "tabldot",
      "cesitli",
      "gunluk"
    ],
    "address": "Postane Mah. Saglik Sok. No:12, Tuzla, Istanbul",
    "phone": "0216 402 10 64",
    "competition_slots": [
      {
        "slot": "lunch",
        "start": "11:00",
        "end": "14:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "20:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Pilav",
        "emoji": "🍚"
      },
      {
        "name": "Kuru Fasulye",
        "emoji": "🫘"
      },
      {
        "name": "Mercimek Corbasi",
        "emoji": "🍲"
      }
    ]
  },
  {
    "name": "Tuzla Cikolatacisi",
    "cuisine": "Tatlici",
    "area": "Tuzla Merkez",
    "district": "Tuzla Merkez",
    "rating": 4.8,
    "price_level": 2,
    "calories_min": 200,
    "calories_max": 450,
    "description": "El yapimi cikolata, truffle, pralin ve sicak cikolata. Cikolata sevenlerin cenneti.",
    "tags": [
      "cikolata",
      "truffle",
      "el yapimi",
      "sicak cikolata",
      "hediye"
    ],
    "address": "Merkez Mah. Guzel Sok. No:5, Tuzla, Istanbul",
    "phone": "0216 402 20 65",
    "competition_slots": [
      {
        "slot": "afternoon",
        "start": "14:00",
        "end": "17:00"
      },
      {
        "slot": "dinner",
        "start": "18:00",
        "end": "22:00"
      }
    ],
    "available_hours": {
      "open": "10:00",
      "close": "22:00",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    "is_active": 1,
    "source": "seed_tuzla",
    "top3_products": [
      {
        "name": "Baklava",
        "emoji": "🍯"
      },
      {
        "name": "Kunefe",
        "emoji": "🧀"
      },
      {
        "name": "Sutlac",
        "emoji": "🍮"
      }
    ]
  }
];

module.exports = { TUZLA_RESTAURANTS };
