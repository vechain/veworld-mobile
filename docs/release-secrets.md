# Release secrets

Release jobs run in the `ios-release` and `android-release` GitHub environments. An environment secret silently overrides a repository secret with the same name, so every secret lives in exactly one place:

- **Environment:** secrets used by one platform.
- **Repository:** secrets shared by both platforms.

Bundle identifiers are not secrets. They live in `ios/fastlane/Fastfile`, `Appfile` and `Matchfile`, and in `android/fastlane/Appfile`.

## iOS (`ios-release`)

| Secret | Format | Purpose |
| --- | --- | --- |
| `IOS_MATCH_PASSWORD` | plain | Decrypts the match certificates repo |
| `IOS_ASC_KEY_ID` | plain | App Store Connect API key ID |
| `IOS_ASC_ISSUER_ID` | plain | App Store Connect API issuer ID |
| `IOS_ASC_KEY_P8_BASE64` | base64 `.p8` | App Store Connect API key |
| `IOS_SENTRY_PROPERTIES` | base64 file | `ios/sentry.properties`, used by the Xcode bundle phase to upload source maps |
| `IOS_ENV` | base64 file | `ios/fastlane/.env` for the e2e build only |

## Android (`android-release`)

| Secret | Format | Purpose |
| --- | --- | --- |
| `ANDROID_RELEASE_KEYSTORE` | base64 file | Signing keystore |
| `ANDROID_KEYSTORE_PROPERTIES` | base64 file | `android/keystore.properties` |
| `ANDROID_KEY_ALIAS` | base64 | Keystore key alias |
| `ANDROID_STORE_PASSWORD` | base64 | Keystore and key password |
| `ANDROID_SERVICE_ACCOUNT` | base64 JSON | Play Console upload key |
| `ANDROID_SENTRY_PROPERTIES` | base64 file | `android/sentry.properties` |
| `ANDROID_FASTLANE_ENV` | base64 file | `android/.env.default` for the e2e build only |

## Shared (repository)

| Secret | Format | Purpose |
| --- | --- | --- |
| `CI_USER`, `CI_USER_TOKEN` | plain | Bot account that pushes release branches and reads the match certificates repo |
| `RN_ENV_PROD` | base64 file | `.env.production` baked into the app |
| `SLACK_RELEASE_WEBHOOK` | plain URL | Posts each release result; a Slack failure never fails the release |

## Rotating a secret

```sh
# Environment secret
gh secret set IOS_MATCH_PASSWORD --env ios-release --repo vechain/veworld-mobile
# File secret
base64 -i ios/sentry.properties | gh secret set IOS_SENTRY_PROPERTIES --env ios-release --repo vechain/veworld-mobile
# Repository secret
gh secret set SLACK_RELEASE_WEBHOOK --repo vechain/veworld-mobile
```

To find names defined at both levels, which is always a mistake:

```sh
for env in ios-release android-release; do
  comm -12 <(gh secret list -R vechain/veworld-mobile | cut -f1 | sort) \
           <(gh secret list -R vechain/veworld-mobile --env "$env" | cut -f1 | sort)
done
```
