#!/bin/bash

if [ ! -f .env.example ]; then
  echo ".env.example not found. Please create it first."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Copied .env.example to .env"
fi

prev_line_empty=false
while IFS= read -r line; do
  if [[ -z "$line" ]]; then
    prev_line_empty=true
    continue
  fi
  if [[ "$line" =~ ^[[:space:]]*# ]]; then
    continue
  fi
  if [[ "$line" == *"="* ]]; then
    var_name="${line%%=*}"
    var_name="${var_name// /}"
    var_value="${line#*=}"
    if ! grep -q "^${var_name}=" .env 2>/dev/null; then
      if [ "$prev_line_empty" = true ]; then
        echo "" >> .env
        prev_line_empty=false
      fi
      if [[ -n "$var_value" ]]; then
        echo "${var_name}=${var_value}" >> .env
      else
        echo "${var_name}=dummy_value" >> .env
      fi
    fi
  fi
  prev_line_empty=false
done < .env.example

echo "Added missing variables from .env.example to .env"

