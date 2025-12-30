#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Starting backend services..."

# Function to check if a container is running
is_running() {
    [ "$(docker ps -q -f name=^/$1$)" ]
}

# Function to check if a container exists (running or stopped)
container_exists() {
    [ "$(docker ps -aq -f name=^/$1$)" ]
}

# Start recipe-db (PostgreSQL)
if is_running "recipe-db"; then
    echo -e "${GREEN}✓${NC} recipe-db is already running"
else
    if container_exists "recipe-db"; then
        echo "Starting recipe-db..."
        docker start recipe-db
        echo -e "${GREEN}✓${NC} recipe-db started"
    else
        echo "Creating and starting recipe-db..."
        # Create temporary init script for schema creation
        cat > /tmp/test-db-init.sql <<EOF
CREATE SCHEMA IF NOT EXISTS recipe;
ALTER DATABASE recipe SET search_path TO recipe, public;
EOF
        docker run -d \
            --name recipe-db \
            -e POSTGRES_USER=recipe_user \
            -e POSTGRES_PASSWORD=recipe_pass \
            -e POSTGRES_DB=recipe \
            -v /tmp/test-db-init.sql:/docker-entrypoint-initdb.d/init.sql \
            -p 5432:5432 \
            postgres:15
        echo -e "${GREEN}✓${NC} recipe-db created and started"
    fi
fi

# Wait a moment for database to be ready
sleep 2

# Start recipe-service
if is_running "recipe-service"; then
    echo -e "${GREEN}✓${NC} recipe-service is already running"
else
    if container_exists "recipe-service"; then
        echo "Starting recipe-service..."
        docker start recipe-service
        echo -e "${GREEN}✓${NC} recipe-service started"
    else
        echo "Creating and starting recipe-db..."
        docker run -itd \
            -e MONGO_LOCATION=NaN \
            -e MONGO_USER=NaN \
            -e MONGO_PASSWORD=NaN \
            -e METRICS_REPOSITORY_LOCATION=NaN \
            -e METRICS_REPOSITORY_PORT=NaN \
            -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
            -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
            -e AWS_REGION=$AWS_REGION \
            -e POSTGRES_URL=jdbc:postgresql://host.docker.internal:5432/recipe \
            -e POSTGRES_USERNAME=recipe_user \
            -e POSTGRES_PASSWORD=recipe_pass \
            -p 5555:5555 --restart=on-failure:10 \
            --name recipe-service recipe-service-img
        echo -e "${GREEN}✓${NC} recipe-service created and started"
    fi
fi

echo ""
echo "Backend services are ready!"
echo "PostgreSQL: localhost:5432 (user: recipe_user, db: recipe_db)"
echo "Recipe Service: localhost:5555"
echo "Setting env vars for front end..."
export SERVICE_IP=localhost
export WEB_IP=localhost:8000
export GOOGLE_CLIENT_SECRET=NaN
export GOOGLE_CLIENT_ID=NaN
echo "Done!"
npm start