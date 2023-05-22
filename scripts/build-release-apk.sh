npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/build/intermediates/res/merged/release
rm -rf android/app/src/main/res/drawable-* 
rm -rf android/app/src/main/res/raw/*
cd android
./gradlew clean
./gradlew assembleRelease --warning-mode all
cd ..