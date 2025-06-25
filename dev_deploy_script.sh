#!/bin/bash

DRY_RUN=$1

echo "Pulling latest code from dev branch of repository..."
git pull https://$1:$2@github.com/amanmyrats/airporttransfer $3

cd /home/ubuntu/dev/airporttransfer/backend

echo "Installing dependencies..."
./venv/bin/pip3 install -r requirements.txt

echo "Running migrations..."
./venv/bin/python3 manage.py migrate

echo "Collect static files"
./venv/bin/python3 manage.py collectstatic --no-input

echo "Reloading the daemon..."
sudo systemctl daemon-reload

echo "Restarting the server..."
sudo systemctl restart dev.airporttransfer.gunicorn

echo "Deployment complete."
