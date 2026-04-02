/**
 * FoodHunt Regions Seed Data
 * Hierarchical structure: İl (Province) → İlçe (District) → Mahalle (Neighborhood)
 */

const REGIONS = [
  {
    il: 'İstanbul',
    ilceler: [
      {
        name: 'Tuzla',
        lat: 40.8169,
        lng: 29.3003,
        is_active: true,
        mahalleler: ['Tuzla Merkez', 'Kampüs Çevresi', 'Sahil', 'Aydınlı', 'Postane', 'İçmeler', 'Orhanlı', 'Mimar Sinan', 'Yayla', 'Evliya Çelebi', 'Cami', 'Aydıntepe']
      },
      {
        name: 'Kadıköy',
        lat: 40.9828,
        lng: 29.0290,
        is_active: false,
        mahalleler: ['Moda', 'Bahariye', 'Caferağa', 'Osmanağa', 'Fenerbahçe', 'Bostancı', 'Göztepe', 'Suadiye', 'Kozyatağı', 'Acıbadem', 'Hasanpaşa', 'Rasimpaşa']
      },
      {
        name: 'Beşiktaş',
        lat: 41.0420,
        lng: 29.0070,
        is_active: false,
        mahalleler: ['Beşiktaş Merkez', 'Bebek', 'Ortaköy', 'Etiler', 'Levent', 'Arnavutköy', 'Kuruçeşme']
      },
      {
        name: 'Beyoğlu',
        lat: 41.0370,
        lng: 28.9770,
        is_active: false,
        mahalleler: ['İstiklal', 'Galata', 'Cihangir', 'Karaköy', 'Taksim', 'Asmalımescit', 'Pera', 'Tophane']
      },
      {
        name: 'Şişli',
        lat: 41.0600,
        lng: 28.9870,
        is_active: false,
        mahalleler: ['Mecidiyeköy', 'Nişantaşı', 'Bomonti', 'Teşvikiye', 'Osmanbey', 'Fulya', 'Esentepe']
      },
      {
        name: 'Üsküdar',
        lat: 41.0235,
        lng: 29.0153,
        is_active: false,
        mahalleler: ['Üsküdar Merkez', 'Çengelköy', 'Beylerbeyi', 'Kuzguncuk', 'Altunizade', 'Acıbadem']
      },
      {
        name: 'Fatih',
        lat: 41.0186,
        lng: 28.9497,
        is_active: false,
        mahalleler: ['Sultanahmet', 'Eminönü', 'Laleli', 'Aksaray', 'Balat', 'Fener', 'Sirkeci']
      },
      {
        name: 'Bakırköy',
        lat: 40.9800,
        lng: 28.8720,
        is_active: false,
        mahalleler: ['Bakırköy Merkez', 'Florya', 'Yeşilköy', 'Ataköy', 'Zuhuratbaba']
      },
      {
        name: 'Ataşehir',
        lat: 40.9830,
        lng: 29.1100,
        is_active: false,
        mahalleler: ['Ataşehir Merkez', 'İçerenköy', 'Küçükbakkalköy', 'Kayışdağı', 'Yenisahra']
      },
      {
        name: 'Maltepe',
        lat: 40.9340,
        lng: 29.1320,
        is_active: false,
        mahalleler: ['Maltepe Merkez', 'Cevizli', 'Dragos', 'İdealtepe', 'Altıntepe']
      },
      {
        name: 'Sarıyer',
        lat: 41.1670,
        lng: 29.0500,
        is_active: false,
        mahalleler: ['Sarıyer Merkez', 'İstinye', 'Tarabya', 'Emirgan', 'Rumelihisarı', 'Maslak']
      }
    ]
  }
];

module.exports = { REGIONS };
