#!/bin/bash

# Check if two arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <versionCode> <versionName>"
    exit 1
fi

# Assign the arguments to variables
newVersionCode=$1
newVersionName=$2

# File path to the build.gradle file
gradleFilePath="../app/build.gradle"

# Update versionCode
sed -i '.bak' "/versionCode/c\\
        versionCode $newVersionCode
" "$gradleFilePath"

# Update versionName
sed -i '.bak' "/versionName/c\\
        versionName \"$newVersionName\"
" "$gradleFilePath"


echo "build.gradle updated successfully."
