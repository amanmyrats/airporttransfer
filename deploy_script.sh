#!/bin/bash

DRY_RUN=$1

echo "Pulling latest code from repository..."
# Skip actual git pull in dry run
# [ "$DRY_RUN" != "true" ] && 
# git pull origin main
git pull https://$1:$2@github.com/amanmyrats/airporttransfer $3

# echo "Setting up permissions..."
# Add your user to the group:
# sudo usermod -a -G www-data ubuntu
# Change the group ownership of the directory:
# sudo chown -R ubuntu:www-data /home/ubuntu/airporttransfer/backend/static
# Set the group-writable permission:
# sudo chmod -R g+w /home/ubuntu/airporttransfer/backend/static
# Ensure new files inherit the group:
# sudo chmod g+s /home/ubuntu/airporttransfer/backend/static

cd /home/ubuntu/airporttransfer/backend

echo "Installing dependencies..."
# Skip actual installation in dry run
# [ "$DRY_RUN" != "true" ] && 
./venv/bin/pip3 install -r requirements.txt

echo "Running migrations..."
# Skip actual migrations in dry run
# [ "$DRY_RUN" != "true" ] && 
./venv/bin/python3 manage.py migrate

echo "Collect static files"
# Skip collectstatic in dry run
# [ "$DRY_RUN" != "true" ] && 
./venv/bin/python3 manage.py collectstatic --no-input

echo "Reloading the daemon..."
sudo systemctl daemon-reload

echo "Restarting the server..."
# Skip actual restart in dry run
# [ "$DRY_RUN" != "true" ] && 
sudo systemctl restart airporttransfer.gunicorn


# echo "Restarting the celery..."
# sudo systemctl restart celery

# echo "Restarting the celery.beat..."
# sudo systemctl restart celery.beat

echo "Deployment complete."
