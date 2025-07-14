#!/bin/bash

# Variables
DB_NAME="dev-airporttransfer"
DB_USER="****"
DB_PASS="****"
S3_BUCKET="****"
BACKUP_DIR="/home/ubuntu/database-backups"
DATE=$(date +\%Y-\%m-\%d)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_$DATE.dev.backup.db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform the backup
export PGPASSWORD=$DB_PASS
pg_dump -U $DB_USER -F c -b -v -f $BACKUP_FILE $DB_NAME

# Upload the backup to S3
aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/dev/airporttransfer/database-backup/

# Find and delete backups older than 30 days from S3
aws s3 ls s3://$S3_BUCKET/dev/airporttransfer/database-backup/ | grep -Eo 'dev-airporttransfer_[0-9]{4}-[0-9]{2}-[0-9]{2}.dev.backup.db' | while read -r line; do
    BACKUP_DATE=$(echo $line | grep -Eo '[0-9]{4}-[0-9]{2}-[0-9]{2}')
    if [[ $(date -d $BACKUP_DATE +%s) -lt $(date -d '30 days ago' +%s) ]]; then
        aws s3 rm s3://$S3_BUCKET/dev/airporttransfer/database-backup/$line
    fi
done

# Optional: Remove local backup files older than 7 days
find $BACKUP_DIR -type f -name '*.backup.db' -mtime +7 -exec rm {} \;
