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

# Loop through each .env file
for file in $env_files; do
    # Check if IS_CI_BUILD_ENABLED is declared in the .env file
    if ! grep -q "^IS_CI_BUILD_ENABLED=" "$file"; then
        echo "Error: IS_CI_BUILD_ENABLED is not declared in $file"
        exit 1
    fi

    # Use sed to replace the value in each .env file
    sed -i '.bak' "s|^IS_CI_BUILD_ENABLED=.*|IS_CI_BUILD_ENABLED=${ci_value}|" "$file"
    echo "Updated IS_CI_BUILD_ENABLED in $file"
done

# Delete backup files
find ../.. -type f -name "*.bak" -delete
