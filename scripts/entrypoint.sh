#!/bin/bash
# ============================================================
# Hytale Server - Entrypoint
# ============================================================

# ============================================================
# Set timezone at runtime from TZ environment variable
# ============================================================
if [ -n "$TZ" ] && [ -f "/usr/share/zoneinfo/$TZ" ]; then
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime
    echo $TZ > /etc/timezone
    echo "[INFO] Timezone set to: $TZ"
else
    echo "[WARN] Invalid or missing TZ variable, using default timezone"
fi

# ============================================================
# Check/Download server files
# ============================================================
echo "[INFO] Checking server files..."

SERVER_JAR="/opt/hytale/server/HytaleServer.jar"
ASSETS_FILE="/opt/hytale/server/Assets.zip"
DOWNLOADER_DIR="/opt/hytale/downloader"
CREDENTIALS_FILE="${DOWNLOADER_DIR}/.hytale-downloader-credentials.json"


# Function to run Hytale Downloader
run_downloader() {
    # Download the downloader tool
    DOWNLOADER_BIN="${DOWNLOADER_DIR}/hytale-downloader-linux-amd64"

    if [ ! -f "$DOWNLOADER_BIN" ]; then
        echo "[INFO] Downloading Hytale Downloader from official source..."
        cd "$DOWNLOADER_DIR"
        wget -q --show-progress -O hytale-downloader.zip "https://downloader.hytale.com/hytale-downloader.zip"
        unzip -o hytale-downloader.zip >/dev/null
        rm -f hytale-downloader.zip
    fi

    cd "$DOWNLOADER_DIR"
    PATCHLINE=${HYTALE_PATCHLINE:-release}
    echo "[INFO] Using patchline: $PATCHLINE"
    DOWNLOAD_PATH="/opt/hytale/server/game.zip"
    VERSION_FILE="/opt/hytale/server/.hytale-version"
    
    # Loop until download succeeds
    MAX_ATTEMPTS=60
    ATTEMPT=0
    
    while [ ! -f "$DOWNLOAD_PATH" ]; do
        ATTEMPT=$((ATTEMPT + 1))
        
        # Check if credentials exist
        if [ ! -f "$CREDENTIALS_FILE" ]; then
            echo ""
            echo "╔══════════════════════════════════════════════════════════╗"
            echo "║  AUTHENTICATION REQUIRED                                 ║"
            echo "╚══════════════════════════════════════════════════════════╝"
            echo ""
        fi
        
        
        # Run downloader directly - output goes straight to console
        ./hytale-downloader-linux-amd64 -patchline "$PATCHLINE" -download-path "$DOWNLOAD_PATH" -skip-update-check
        RESULT=$?
        
        if [ $RESULT -eq 0 ] && [ -f "$DOWNLOAD_PATH" ]; then
            echo "[INFO] Download successful!"
            break
        else
            echo "[INFO] Download failed! Waiting for manual intervention..."
            # Wait forever instead of crashing
            while true; do
                if [ -f "$SERVER_JAR" ] && [ -f "$ASSETS_FILE" ]; then
                    echo "[INFO] Files detected! Continuing..."
                    return 0
                fi
                sleep 10
            done
            
            echo "[INFO] Waiting 10 seconds before retry..."
            sleep 10
        fi
    done
    
    # Extract the downloaded zip
    if [ -f "$DOWNLOAD_PATH" ]; then
        echo "[INFO] Extracting game files..."
        cd /opt/hytale/server
        
        unzip -o game.zip >/dev/null || true
        
        # Move files to correct locations
        if [ -d "Server" ]; then
            mv Server/* . 2>/dev/null || true
            rm -rf Server
        fi
        
        rm -f game.zip
        echo "[INFO] Extraction complete!"

        cd "$DOWNLOADER_DIR"
        INSTALLED_VER=$(./hytale-downloader-linux-amd64 -patchline "$PATCHLINE" -print-version 2>/dev/null)
        if [ -n "$INSTALLED_VER" ]; then
            echo "$INSTALLED_VER" > "$VERSION_FILE"
            echo "[INFO] Saved version $INSTALLED_VER to $VERSION_FILE"
        fi

    fi

    return 0
}

# Check if files exist
if [ -f "$SERVER_JAR" ] && [ -f "$ASSETS_FILE" ]; then
    echo "[INFO] Server files found!"
# Use official Hytale Downloader
else
    echo "[INFO] Using official Hytale Downloader..."
    run_downloader
fi

# ============================================================
# Final check
# ============================================================
if [ ! -f "$SERVER_JAR" ] || [ ! -f "$ASSETS_FILE" ]; then
    echo "[ERROR] Server files still missing!"
    echo "[ERROR] Expected: $SERVER_JAR"
    echo "[ERROR] Expected: $ASSETS_FILE"
    echo ""
    echo "Contents of /opt/hytale/server/:"
    ls -la /opt/hytale/server/ || true
    exit 1
fi

echo "[INFO] Server files verified!"


# ============================================================
# Start server
# ============================================================
echo "[INFO] Starting Hytale Server..."
echo ""
exec /opt/hytale/start-server.sh
