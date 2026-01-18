#!/bin/bash
# ============================================================
# Hytale Server - Start Script
# ============================================================

cd /opt/hytale/data

SERVER_DIR="/opt/hytale/server"

# Java arguments
JAVA_ARGS=(
    "-Xms${JAVA_MIN_RAM}"
    "-Xmx${JAVA_MAX_RAM}"
)

# Server arguments
SERVER_ARGS=(
    "--assets" "${SERVER_DIR}/Assets.zip"
)

# Add backup if enabled
if [ "${ENABLE_BACKUP}" = "true" ]; then
    SERVER_ARGS+=(
        "--backup"
        "--backup-dir" "/opt/hytale/backups"
        "--backup-frequency" "${BACKUP_FREQUENCY}"
    )
fi

# Add auth mode if set
if [ -n "${AUTH_MODE}" ]; then
    SERVER_ARGS+=("--auth-mode" "${AUTH_MODE}")
fi

ALL_CMD="java ${JAVA_ARGS[*]} -jar ${SERVER_DIR}/HytaleServer.jar ${SERVER_ARGS[*]}"

echo "============================================================"
echo "Starting with: ${ALL_CMD}"
echo "============================================================"

exec ${ALL_CMD}
