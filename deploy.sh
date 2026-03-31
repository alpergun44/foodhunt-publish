#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# FoodHunt — Railway Deploy Script
# Tek komutla canlıya al: ./deploy.sh
# ═══════════════════════════════════════════════════════════════
set -e

GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
RED='\033[1;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════╗"
echo "║     🍽️  FoodHunt Deploy              ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

cd "$(dirname "$0")"

# ─── 1. Check Railway CLI ────────────────────────────────────
echo -e "${YELLOW}[1/5] Railway CLI kontrol ediliyor...${NC}"
if ! command -v railway &> /dev/null; then
  echo -e "${RED}Railway CLI bulunamadı. Kuruluyor...${NC}"
  npm install -g @railway/cli
fi
echo -e "  ✅ Railway CLI $(railway --version 2>/dev/null || echo 'kuruldu')"

# ─── 2. Check login ─────────────────────────────────────────
echo -e "${YELLOW}[2/5] Railway hesap kontrolü...${NC}"
if ! railway whoami &> /dev/null 2>&1; then
  echo -e "${CYAN}Railway'e giriş yapman gerekiyor:${NC}"
  railway login
fi
echo -e "  ✅ Giriş yapıldı"

# ─── 3. Git init if needed ───────────────────────────────────
echo -e "${YELLOW}[3/5] Git repo kontrol ediliyor...${NC}"
if [ ! -d ".git" ]; then
  git init
  git add -A
  git commit -m "Initial commit: FoodHunt v2.2 — publish-ready"
  echo -e "  ✅ Git repo oluşturuldu"
else
  # Stage and commit any changes
  git add -A
  git diff --cached --quiet || git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')"
  echo -e "  ✅ Git repo hazır"
fi

# ─── 4. Link or create Railway project ──────────────────────
echo -e "${YELLOW}[4/5] Railway projesi kontrol ediliyor...${NC}"
if [ ! -f ".railway" ] && [ ! -d ".railway" ]; then
  echo -e "${CYAN}Yeni Railway projesi oluşturuluyor...${NC}"
  railway init
fi
echo -e "  ✅ Railway projesi bağlandı"

# ─── 5. Deploy ──────────────────────────────────────────────
echo -e "${YELLOW}[5/5] Deploy başlıyor...${NC}"
railway up --detach

echo -e ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ Deploy başlatıldı!                                ║"
echo "║                                                       ║"
echo "║  📊 Deploy durumunu gör:                              ║"
echo "║     railway logs                                      ║"
echo "║                                                       ║"
echo "║  🌐 Site URL'ini gör:                                 ║"
echo "║     railway domain                                    ║"
echo "║                                                       ║"
echo "║  ⚙️  Environment variables ayarla:                     ║"
echo "║     railway variables set NODE_ENV=production          ║"
echo "║     railway variables set JWT_SECRET=<güçlü-secret>   ║"
echo "║     railway variables set ADMIN_PASSWORD=<şifren>     ║"
echo "║                                                       ║"
echo "║  🔗 Custom domain ekle:                               ║"
echo "║     railway domain add foodhunt.app                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"
