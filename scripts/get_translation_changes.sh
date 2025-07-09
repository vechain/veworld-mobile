#!/bin/bash

# Function to extract keys from git diff output
get_changed_keys() {
    # Get the git diff for en.json
    git diff HEAD src/i18n/translations/en.json | \
    # Look for lines that start with + or - and contain a key pattern
    grep -E '^\+|-\s+"[^"]+":' | \
    # Extract just the key part (everything between the first " and the next ")
    sed -E 's/^[+-]\s+"([^"]+)":.*/\1/' | \
    # Sort and get unique keys (to handle both old and new values)
    sort | uniq | \
    # Format as array elements without newlines
    awk 'BEGIN {print "["} 
         {printf("%s\"%s\"", (NR==1)?"":", ", $0)} 
         END {print "]"}'
}

# Execute the function
get_changed_keys
