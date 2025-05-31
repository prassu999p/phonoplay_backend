#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.local"

# Check if .env.local already exists
if [ -f "$ENV_FILE" ]; then
  echo "Warning: $ENV_FILE already exists. Do you want to overwrite it? (y/N)"
  read -r OVERWRITE
  if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
    echo "Aborting. No changes were made."
    exit 1
  fi
fi

# Get Supabase URL and Anon Key
SUPABASE_URL="https://mkuquzgcvktcfhgagoec.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdXF1emdjdmt0Y2ZoZ2Fnb2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTc0NjAsImV4cCI6MjA2NDIzMzQ2MH0.3aOlgo8dQ4kn70ZrQpqp1b0GJSIQ1OZ4ODP7-9SeY4U"

# Create .env.local with the Supabase credentials
cat > "$ENV_FILE" <<EOL
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# OpenAI Configuration (for future use)
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs Configuration (for future use)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Session Configuration (in seconds)
NEXT_PUBLIC_SESSION_TIMEOUT=3600  # 1 hour
EOL

echo "✅ Created $ENV_FILE with Supabase configuration"
echo "📝 Please update the API keys in $ENV_FILE with your actual keys"
