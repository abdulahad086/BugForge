#!/bin/bash
set -e

echo "=== 🚀 Starting BugForge Deployment on Azure VM ==="

# 1. Update package index and install Docker if missing
if ! command -v docker &> /dev/null; then
  echo "Installing Docker & Docker Compose..."
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo usermod -aG docker $USER
fi

# 2. Pull latest production Docker images from GHCR
echo "Pulling latest Docker images from GitHub Container Registry (GHCR)..."
docker pull ghcr.io/abdulahad086/bugforge-backend:latest
docker pull ghcr.io/abdulahad086/bugforge-frontend:latest

# 3. Create app deployment directory
mkdir -p ~/bugforge
cd ~/bugforge

# 4. Write production docker-compose.yml on Azure VM
cat << 'EOF' > docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: bugforge-postgres
    restart: always
    environment:
      POSTGRES_DB: bugforge_db
      POSTGRES_USER: bugforge_user
      POSTGRES_PASSWORD: bugforge_password_2026!
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bugforge_user -d bugforge_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    image: ghcr.io/abdulahad086/bugforge-backend:latest
    container_name: bugforge-backend
    restart: always
    environment:
      DATABASE_URL: postgresql+asyncpg://bugforge_user:bugforge_password_2026!@postgres:5432/bugforge_db
      SECRET_KEY: bugforge_production_secret_key_azure_vm_2026
      ENVIRONMENT: production
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    image: ghcr.io/abdulahad086/bugforge-frontend:latest
    container_name: bugforge-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
EOF

# 5. Restart production container stack
echo "Deploying production containers..."
docker compose down || true
docker compose up -d

echo "=== ✅ Deployment Completed Successfully on Azure VM! ==="
echo "Frontend URL: http://$(curl -s ifconfig.me)"
echo "Backend Health: http://$(curl -s ifconfig.me):8000/api/health"
