#!/bin/bash
# ============================================================
# Docker Entrypoint Wrapper
# Runs as root to fix permissions, then switches to hytale user
# ============================================================

# Get UID/GID from environment or use defaults
HYTALE_UID=${HYTALE_UID:-9000}
HYTALE_GID=${HYTALE_GID:-9000}

# If running as root, fix permissions first
if [ "$(id -u)" -eq 0 ]; then
    echo "[INFO] Running as root, fixing permissions for volumes (UID: ${HYTALE_UID}, GID: ${HYTALE_GID})..."
    
    # Fix permissions for mounted volumes
    for dir in /opt/hytale/server /opt/hytale/data /opt/hytale/backups /opt/hytale/downloader; do
        if [ -d "$dir" ]; then
            echo "[INFO] Fixing permissions for $dir"
            chown -R ${HYTALE_UID}:${HYTALE_GID} "$dir" 2>/dev/null || true
            chmod -R u+rwX,o+w "$dir" 2>/dev/null || true
        fi
    done
    
    echo "[INFO] Permissions fixed! Switching to user hytale (UID: ${HYTALE_UID})..."
    
    # Switch to hytale user and execute the actual entrypoint
    exec gosu hytale /opt/hytale/entrypoint.sh "$@"
else
    # Already running as hytale user, just execute the entrypoint
    exec /opt/hytale/entrypoint.sh "$@"
fi
