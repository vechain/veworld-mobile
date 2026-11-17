### Android Build

Version codes come from Google Play: each release uses the highest code on any track plus one. The version name defaults to the one in `package.json`.

On the terminal inside the android directory:

```bash
fastlane build_android
```

To release a different version name:

```bash
fastlane build_android version_name:<version>
```
