#!/usr/bin/env bash
set -euo pipefail

# 🔧 Set your Docker Hub username here
DOCKER_USERNAME="shahharsh25"

# Map Docker image names to their build contexts (directories)
declare -A services=(
  ["auth-service"]="authservice"
  ["appointment-service"]="appointmentbooking"
  ["messaging-service"]="onetoonemessagingservice"
  ["groupchat-service"]="groupmessagingservice"
  ["notification-service"]="notificationservice"
  ["api-gateway"]="apigateway"
)

echo "🚀 Starting build and push of all service artifacts and Docker images..."

for image in "${!services[@]}"; do
  dir="${services[$image]}"
  if [ ! -d "$dir" ]; then
    echo "⛔️ Directory '$dir' not found; skipping $image"
    continue
  fi

  echo
  echo "📦 Building Maven artifact for '$dir'..."
  (cd "$dir" && mvn clean package -DskipTests)

  echo "🛠  Building Docker image '$image:latest' from directory '$dir'..."
  docker build -t "$image:latest" "$dir"

  # Tag and push to Docker Hub
  full_image="$DOCKER_USERNAME/$image:latest"
  echo "🔖 Tagging image as '$full_image'..."
  docker tag "$image:latest" "$full_image"

   echo "📤 Pushing '$full_image' to Docker Hub..."
   docker push "$full_image"
done

echo
echo "✅ All artifacts built and images pushed successfully!"
