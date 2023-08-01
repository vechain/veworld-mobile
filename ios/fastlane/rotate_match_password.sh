#!/bin/bash


generate_random_password() {
    length=${1:-12}
    special_chars="@#$%^&*()_-+=~"
    all_chars="[:alnum:]${special_chars}"
    password=$(LC_ALL=C tr -dc "$all_chars" < /dev/urandom | fold -w "$length" | head -n 1)
    echo "$password"
}

# Set the variable and value you want to modify
# For example, to modify the value of MATCH_PASSWORD, set the following variables
# Note: Make sure to escape any special characters in the value.
variable="MATCH_PASSWORD"
new_value=$(generate_random_password)

# Check if the .env file exists
env_file=".env.default"
if [ ! -f "$env_file" ]; then
    echo "The .env file does not exist. Please create one first."
    exit 1
fi

# Create a backup of the original .env.default file
backup_file="$env_file.bak"
cp "$env_file" "$backup_file"

# Modify the .env file using 'sed'
# This will replace the value of the specified variable in the .env file.
sed "s/^$variable=.*/$variable=$new_value/" "$backup_file" > "$env_file"
rm .env.default.bak

echo "Variable $variable has been updated to $new_value in the .env file."



