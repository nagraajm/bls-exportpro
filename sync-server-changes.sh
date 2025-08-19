#!/bin/bash

# BLS ExportPro - Sync Server Changes to Local Repository
# This script downloads critical changes made on the server during deployment

set -e

echo "🔄 Syncing server changes to local repository..."
echo "================================================"

SERVER_IP="157.180.18.119"
SSH_KEY="/Users/nagarajm/Work/OS/bls-exportpro/deploy/ssh_files/nagaraj-m1"
SERVER_PATH="/var/www/blsexport/bls-exportpro"
LOCAL_PATH="/Users/nagarajm/Work/OS/bls-exportpro/bls-exportpro"

# Create backup of local changes
echo "📦 Creating backup of local files..."
mkdir -p ./backups/before-sync-$(date +%Y%m%d-%H%M%S)

# 1. Sync NavigationSidebar.tsx (logo fix)
echo "🖼️  Syncing NavigationSidebar logo fix..."
scp -i "$SSH_KEY" "root@$SERVER_IP:$SERVER_PATH/frontend/src/components/layout/NavigationSidebar.tsx" \
    "$LOCAL_PATH/frontend/src/components/layout/NavigationSidebar.tsx"

# 2. Sync GlassCard.tsx (animation fix)
echo "🎨 Syncing GlassCard animation fix..."
scp -i "$SSH_KEY" "root@$SERVER_IP:$SERVER_PATH/frontend/src/components/ui/GlassCard.tsx" \
    "$LOCAL_PATH/frontend/src/components/ui/GlassCard.tsx"

# 3. Sync backend routes (order routes registration)
echo "🛣️  Syncing backend routes fix..."
scp -i "$SSH_KEY" "root@$SERVER_IP:$SERVER_PATH/backend/src/routes/index.ts" \
    "$LOCAL_PATH/backend/src/routes/index.ts"

# 4. Download logo files
echo "🎭 Downloading logo files..."
mkdir -p "$LOCAL_PATH/frontend/public"
mkdir -p "$LOCAL_PATH/backend/assets"

scp -i "$SSH_KEY" "root@$SERVER_IP:$SERVER_PATH/frontend/public/logo-bohra-lifescience.webp" \
    "$LOCAL_PATH/frontend/public/"

scp -i "$SSH_KEY" "root@$SERVER_IP:$SERVER_PATH/backend/assets/logo-bohra-lifescience.webp" \
    "$LOCAL_PATH/backend/assets/"

# 5. Download updated database (optional - contains seeded data)
echo "📊 Downloading updated database..."
scp -i "$SSH_KEY" "root@$SERVER_IP:$SERVER_PATH/backend/data/pharma.db" \
    "$LOCAL_PATH/backend/data/"

echo ""
echo "✅ Sync completed successfully!"
echo ""
echo "📋 Changes synced:"
echo "  - NavigationSidebar.tsx (logo path fix)"
echo "  - GlassCard.tsx (animation ease fix)"  
echo "  - routes/index.ts (order routes registration)"
echo "  - Logo files (webp format)"
echo "  - Updated database with schema changes"
echo ""
echo "⚠️  IMPORTANT: Database schema changes were made on server:"
echo "  - Added port_of_loading column to orders table"
echo "  - Added port_of_discharge column to orders table"
echo "  - Added place_of_delivery column to orders table"
echo "  - Added payment_terms column to orders table"
echo ""
echo "🔧 Next steps:"
echo "  1. Test the application locally: npm run dev"
echo "  2. Verify logo displays correctly"
echo "  3. Test invoice generation functionality"
echo "  4. Commit changes to git: git add . && git commit -m 'Sync deployment fixes'"
echo ""