#!/usr/bin/env bash
# PostgreSQL avtomatik backup skripti.
# Cron'ga qo'shish (har kuni soat 03:00):  0 3 * * * /path/to/scripts/backup-db.sh
set -euo pipefail

# Cron skriptni uy papkasidan ishga tushiradi — docker compose loyiha papkasida ishlashi kerak.
cd "$(dirname "$0")/.."

# DB nomi/foydalanuvchisi docker-compose bilan bir xil manbadan — root .env
if [ -f .env ]; then
  set -a; . ./.env; set +a
fi

BACKUP_DIR="${BACKUP_DIR:-/var/backups/ustaxona}"
DB_NAME="${POSTGRES_DB:-ustaxona}"
DB_USER="${POSTGRES_USER:-ustaxona}"
KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
FILE="$BACKUP_DIR/${DB_NAME}_${STAMP}.sql.gz"
TMP="$FILE.part"
trap 'rm -f "$TMP"' EXIT  # pg_dump xato bersa yarim fayl backup deb qolib ketmasin

echo "[$(date)] Backup boshlandi -> $FILE"
docker compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$TMP"
mv "$TMP" "$FILE"

# Eski backuplarni tozalash ($KEEP_DAYS kundan oshiq)
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +"$KEEP_DAYS" -delete

echo "[$(date)] Backup tayyor: $(du -h "$FILE" | cut -f1)"
