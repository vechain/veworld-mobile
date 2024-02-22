#!/bin/bash

# Check if the required argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <ci_value>"
    exit 1
fi

# Assign the argument to the variable
ci_value="$1"

# Find all .env files in the project
# env_files=$(find ../.. -type f -name ".env.production.local")
env_files=$(find ../.. -type f \( -name ".env.production.local" -o -name ".env.local" \))

# Loop through each .env file and update IS_CI_BUILD_ENABLED
for file in $env_files; do
  # Use sed to replace the value in each .env file
  sed -i '.bak' "s|IS_CI_BUILD_ENABLED=.*|IS_CI_BUILD_ENABLED=${ci_value}|" "$file"
  echo "Updated IS_CI_BUILD_ENABLED in $file"
done

find ../.. -type f -name "*.bak" -delete