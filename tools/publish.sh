#!/bin/bash
set -e

cd "$(dirname "$0")/.."

read -p "Commit message: " msg
git add -A
git commit -m "$msg"
git pull --rebase origin main
git push origin main
echo "Published."
