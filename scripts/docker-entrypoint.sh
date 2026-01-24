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
    
    # Setup persistent machine-id for encrypted auth (requires root)
    MACHINE_ID_FILE="/opt/hytale/.machine-id"
    if [ ! -f "$MACHINE_ID_FILE" ]; then
        echo "[INFO] Generating persistent machine-id..."
        # Generate a random UUID-style machine-id
        cat /proc/sys/kernel/random/uuid | tr -d '-' > "$MACHINE_ID_FILE"
        chown ${HYTALE_UID}:${HYTALE_GID} "$MACHINE_ID_FILE"
    fi
    
    # Link to /etc/machine-id (used by Hytale for encryption key)
    if [ -f "$MACHINE_ID_FILE" ]; then
        cp "$MACHINE_ID_FILE" /etc/machine-id 2>/dev/null || true
        chmod 444 /etc/machine-id 2>/dev/null || true
        # Also setup dbus machine-id
        mkdir -p /var/lib/dbus
        cp "$MACHINE_ID_FILE" /var/lib/dbus/machine-id 2>/dev/null || true
        chmod 444 /var/lib/dbus/machine-id 2>/dev/null || true
        echo "[INFO] Machine-ID configured for auth persistence"
    fi
    
    echo "[INFO] Permissions fixed! Switching to user hytale (UID: ${HYTALE_UID})..."
    
    # Switch to hytale user and execute the actual entrypoint
    exec gosu hytale /opt/hytale/entrypoint.sh "$@"
else
    # Already running as hytale user, just execute the entrypoint
    exec /opt/hytale/entrypoint.sh "$@"
fi
