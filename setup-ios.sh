#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# FoodHunt — iOS App Setup Script
#
# Bu script'i Mac'inde çalıştır. Her şeyi otomatik kurar.
# Gereksinimler:
#   - macOS (Xcode 15+)
#   - Node.js 18+
#   - CocoaPods (brew install cocoapods)
#   - Apple Developer Account ($99/yıl)
#
# Kullanım:
#   chmod +x setup-ios.sh
#   ./setup-ios.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e
YELLOW='\033[1;33m'
GREEN='\033[1;32m'
RED='\033[1;31m'
CYAN='\033[1;36m'
NC='\033[0m'

echo -e "${CYAN}
╔═══════════════════════════════════════╗
║     🍽️  FoodHunt iOS Setup           ║
╚═══════════════════════════════════════╝
${NC}"

# ─── Check Requirements ─────────────────────────────────────────────────────

echo -e "${YELLOW}[1/7] Gereksinimler kontrol ediliyor...${NC}"

# Check macOS
if [[ "$(uname)" != "Darwin" ]]; then
  echo -e "${RED}❌ Bu script sadece macOS'ta çalışır!${NC}"
  exit 1
fi
echo "  ✅ macOS algılandı"

# Check Node
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js bulunamadı! brew install node ile kurun.${NC}"
  exit 1
fi
echo "  ✅ Node.js $(node -v)"

# Check Xcode
if ! command -v xcodebuild &> /dev/null; then
  echo -e "${RED}❌ Xcode bulunamadı! App Store'dan Xcode'u kurun.${NC}"
  exit 1
fi
echo "  ✅ Xcode $(xcodebuild -version | head -1)"

# Check CocoaPods
if ! command -v pod &> /dev/null; then
  echo -e "${YELLOW}  ⚠️  CocoaPods bulunamadı, kuruluyor...${NC}"
  brew install cocoapods
fi
echo "  ✅ CocoaPods $(pod --version)"

# ─── Install Dependencies ───────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}[2/7] Backend bağımlılıkları kuruluyor...${NC}"
cd "$(dirname "$0")"
ROOT_DIR=$(pwd)

cd backend
npm install
echo "  ✅ Backend bağımlılıkları kuruldu"

# Create .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  📝 .env dosyası oluşturuldu (API key'leri doldurun!)"
fi

echo ""
echo -e "${YELLOW}[3/7] Frontend bağımlılıkları kuruluyor...${NC}"
cd "$ROOT_DIR/frontend"
npm install
echo "  ✅ Frontend bağımlılıkları kuruldu"

# ─── Build Frontend ─────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}[4/7] Frontend build alınıyor...${NC}"
npm run build
echo "  ✅ Frontend build tamamlandı (dist/)"

# ─── Add iOS Platform ──────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}[5/7] iOS platformu ekleniyor...${NC}"
if [ -d "ios" ]; then
  echo "  ℹ️  iOS dizini zaten var, sync yapılıyor..."
  npx cap sync ios
else
  npx cap add ios
  npx cap sync ios
fi
echo "  ✅ iOS projesi hazır"

# ─── Configure iOS Project ──────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}[6/7] iOS ayarları yapılandırılıyor...${NC}"

# Add Geolocation usage description to Info.plist
PLIST="ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  # Check if already added
  if ! grep -q "NSLocationWhenInUseUsageDescription" "$PLIST"; then
    # Add before closing </dict>
    sed -i '' 's|</dict>|<key>NSLocationWhenInUseUsageDescription</key>\
	<string>FoodHunt yakınındaki restoranları bulmak için konumunuzu kullanır</string>\
</dict>|' "$PLIST"
    echo "  ✅ Konum izni açıklaması eklendi"
  else
    echo "  ℹ️  Konum izni açıklaması zaten var"
  fi
fi

# Install iOS pods
cd ios/App
pod install
cd "$ROOT_DIR/frontend"
echo "  ✅ CocoaPods bağımlılıkları kuruldu"

# ─── Done ────────────────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}[7/7] Son adımlar...${NC}"
echo ""
echo -e "${GREEN}
╔═══════════════════════════════════════════════════════════╗
║  ✅ FoodHunt iOS kurulumu tamamlandı!                     ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  📱 Xcode'da aç:                                         ║
║     npx cap open ios                                      ║
║     (veya: open ios/App/App.xcworkspace)                  ║
║                                                           ║
║  🔧 Xcode'da yapılacaklar:                               ║
║     1. Signing & Capabilities → Team seç                  ║
║     2. Bundle ID: com.foodhunt.app                        ║
║     3. App Icons ekle (1024x1024)                         ║
║     4. LaunchScreen.storyboard düzenle                    ║
║                                                           ║
║  🚀 Geliştirme:                                          ║
║     cd frontend && npm run dev  (web dev server)          ║
║     cd backend && node server.js (API server)             ║
║     npm run cap:build  (iOS build + sync)                 ║
║                                                           ║
║  📦 App Store:                                            ║
║     Product → Archive → Distribute App                    ║
║                                                           ║
║  ⚠️  Unutma:                                              ║
║     backend/.env dosyasındaki API key'leri doldur!        ║
║     GOOGLE_PLACES_API_KEY=...                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${NC}"

# Offer to open Xcode
echo -e "${CYAN}Xcode'u şimdi açmak ister misin? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
  npx cap open ios
fi
