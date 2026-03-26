/**
 * FoodHunt — Google Places API (New) Integration Service
 *
 * Fetches nearby restaurants using Google Places Nearby Search (New).
 * Transforms Google data into FoodHunt restaurant schema.
 * Includes in-memory cache to avoid repeated API calls.
 *
 * Requires: GOOGLE_PLACES_API_KEY env variable
 */
const logger = require('../utils/logger');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const NEARBY_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const DETAILS_URL = 'https://places.googleapis.com/v1/places';

// In-memory cache: key = "lat,lng,radius" -> { data, ts }
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Search nearby restaurants using Google Places API (New)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default 2000)
 * @param {number} maxResults - Max results (default 20, max 20 per request)
 * @returns {Promise<Array>} Array of FoodHunt-format restaurant objects
 */
async function searchNearby(lat, lng, radius = 2000, maxResults = 20) {
  if (!API_KEY) {
    logger.warn('Google Places API key not configured — using seed data only');
    return [];
  }

  // Check cache
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)},${radius}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    logger.debug('Places cache hit', { key: cacheKey });
    return cached.data;
  }

  try {
    // Google Places API (New) Nearby Search
    const body = {
      includedTypes: ['restaurant', 'cafe', 'meal_takeaway', 'meal_delivery'],
      maxResultCount: Math.min(maxResults, 20),
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius,
        },
      },
      languageCode: 'tr',
    };

    // Field mask controls billing tier — use Basic + some Advanced fields
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.priceLevel',
      'places.types',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.photos',
      'places.currentOpeningHours',
      'places.internationalPhoneNumber',
      'places.websiteUri',
      'places.googleMapsUri',
      'places.editorialSummary',
    ].join(',');

    const res = await fetch(NEARBY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      logger.error('Google Places API error', { status: res.status, error: err });
      return [];
    }

    const data = await res.json();
    const places = data.places || [];

    // Transform to FoodHunt schema
    const restaurants = places.map((p, i) => transformPlace(p, i));

    // Cache results
    cache.set(cacheKey, { data: restaurants, ts: Date.now() });

    logger.info('Google Places fetched', { count: restaurants.length, lat, lng, radius });
    return restaurants;

  } catch (err) {
    logger.error('Google Places fetch failed', { error: err.message });
    return [];
  }
}

/**
 * Transform a Google Places (New) result into FoodHunt restaurant schema
 */
function transformPlace(place, index) {
  // Map Google price level to 1-4 scale
  const priceLevelMap = {
    PRICE_LEVEL_FREE: 1,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };

  // Extract cuisine from types
  const cuisine = extractCuisine(place.types || [], place.primaryTypeDisplayName?.text);

  // Extract area from address
  const area = extractArea(place.formattedAddress || '');

  // Build image URL from photo reference
  let imageUrl = '';
  if (place.photos?.length > 0) {
    const photoRef = place.photos[0].name;
    imageUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=400&maxWidthPx=600&key=${API_KEY}`;
  }

  // Build tags from types
  const tags = (place.types || [])
    .filter(t => !['restaurant', 'food', 'point_of_interest', 'establishment'].includes(t))
    .slice(0, 10)
    .map(t => t.replace(/_/g, ' '));

  return {
    id: Date.now() + index,
    google_place_id: place.id,
    name: place.displayName?.text || 'Bilinmeyen Restoran',
    cuisine: cuisine,
    area: area,
    rating: place.rating || 0,
    price_level: priceLevelMap[place.priceLevel] || 2,
    calories_min: estimateCalories(cuisine, 'min'),
    calories_max: estimateCalories(cuisine, 'max'),
    image_url: imageUrl,
    description: place.editorialSummary?.text || '',
    address: place.formattedAddress || '',
    phone: place.internationalPhoneNumber || '',
    lat: place.location?.latitude || null,
    lng: place.location?.longitude || null,
    google_maps_url: place.googleMapsUri || '',
    website: place.websiteUri || '',
    rating_count: place.userRatingCount || 0,
    is_open: place.currentOpeningHours?.openNow ?? null,
    yemeksepeti_link: '',
    getir_link: '',
    trendyol_link: '',
    tags: tags,
    is_active: 1,
    source: 'google_places',
    created_at: new Date().toISOString(),
  };
}

/**
 * Extract cuisine type from Google place types
 */
function extractCuisine(types, primaryDisplay) {
  // Use primary type display name if available (already in Turkish from API)
  if (primaryDisplay) return primaryDisplay;

  const cuisineMap = {
    turkish_restaurant: 'Türk Mutfağı',
    kebab_shop: 'Kebap',
    pizza_restaurant: 'Pizza',
    sushi_restaurant: 'Suşi',
    chinese_restaurant: 'Çin Mutfağı',
    indian_restaurant: 'Hint Mutfağı',
    italian_restaurant: 'İtalyan',
    japanese_restaurant: 'Japon Mutfağı',
    mexican_restaurant: 'Meksika',
    thai_restaurant: 'Tayland Mutfağı',
    seafood_restaurant: 'Deniz Ürünleri',
    steak_house: 'Steakhouse',
    hamburger_restaurant: 'Burger',
    vegetarian_restaurant: 'Vejetaryen',
    vegan_restaurant: 'Vegan',
    breakfast_restaurant: 'Kahvaltı',
    brunch_restaurant: 'Brunch',
    fast_food_restaurant: 'Fast Food',
    cafe: 'Kafe',
    bakery: 'Fırın',
    ice_cream_shop: 'Dondurma',
    dessert_shop: 'Tatlıcı',
    meal_takeaway: 'Paket Servis',
    meal_delivery: 'Delivery',
  };

  for (const type of types) {
    if (cuisineMap[type]) return cuisineMap[type];
  }

  return 'Restoran';
}

/**
 * Extract neighborhood/area from formatted address
 * Istanbul addresses typically have district info
 */
function extractArea(address) {
  // Common Istanbul districts
  const districts = [
    'Kadıköy', 'Beşiktaş', 'Beyoğlu', 'Şişli', 'Üsküdar', 'Bakırköy',
    'Ataşehir', 'Maltepe', 'Kartal', 'Pendik', 'Sarıyer', 'Fatih',
    'Beykoz', 'Zeytinburnu', 'Eyüpsultan', 'Başakşehir', 'Kağıthane',
    'Bahçelievler', 'Bağcılar', 'Esenyurt', 'Beylikdüzü', 'Çekmeköy',
    'Tuzla', 'Sultanbeyli', 'Sancaktepe', 'Esenler', 'Küçükçekmece',
    'Güngören', 'Bayrampaşa', 'Gaziosmanpaşa', 'Arnavutköy', 'Sultangazi',
    'Avcılar', 'Silivri', 'Büyükçekmece', 'Çatalca', 'Adalar', 'Şile',
    // ASCII versions for matching
    'Kadikoy', 'Besiktas', 'Beyoglu', 'Sisli', 'Uskudar', 'Bakirkoy',
    'Atasehir', 'Sariyer', 'Eyupsultan', 'Basaksehir', 'Kagithane',
    'Bahcelievler', 'Bagcilar', 'Beylikduzu', 'Cekmekoy',
  ];

  for (const d of districts) {
    if (address.includes(d)) return d;
  }

  // Try to extract from address parts (usually after street, before city)
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 3) return parts[parts.length - 3]; // District is usually 3rd from end

  return 'İstanbul';
}

/**
 * Estimate calorie range based on cuisine type
 */
function estimateCalories(cuisine, type) {
  const ranges = {
    'Kebap': { min: 500, max: 900 },
    'Türk Mutfağı': { min: 400, max: 800 },
    'Pizza': { min: 600, max: 1200 },
    'Burger': { min: 500, max: 1000 },
    'Fast Food': { min: 500, max: 1100 },
    'Suşi': { min: 300, max: 600 },
    'Deniz Ürünleri': { min: 350, max: 700 },
    'İtalyan': { min: 450, max: 900 },
    'Vejetaryen': { min: 250, max: 550 },
    'Vegan': { min: 200, max: 500 },
    'Kahvaltı': { min: 350, max: 700 },
    'Kafe': { min: 200, max: 500 },
    'Tatlıcı': { min: 300, max: 600 },
    'Dondurma': { min: 150, max: 400 },
  };
  const r = ranges[cuisine] || { min: 350, max: 750 };
  return r[type];
}

/**
 * Clear expired cache entries
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, val] of cache) {
    if (now - val.ts > CACHE_TTL) cache.delete(key);
  }
}

// Clean cache every 10 minutes
setInterval(clearExpiredCache, 10 * 60 * 1000);

module.exports = {
  searchNearby,
  transformPlace,
  extractCuisine,
  extractArea,
  clearExpiredCache,
};
