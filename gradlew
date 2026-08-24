#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$DIR/android/gradlew" ]; then
  cd "$DIR/android"
  exec ./gradlew "$@"
else
  echo "Error: android/gradlew not found."
  exit 1
fi
