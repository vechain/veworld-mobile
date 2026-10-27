# Release secrets

Release jobs run in the `ios-release` and `android-release` GitHub environments. An environment secret silently overrides a repository secret with the same name, so every secret lives in exactly one place:

- **Environment:** secrets used by one platform.
- **Repository:** secrets shared by both platforms.

Uploads authenticate with the App Store Connect API key, so no Apple ID or app-specific password is needed. Bundle identifiers are not secrets. They live in `ios/fastlane/Fastfile` and `Appfile`, and in `android/fastlane/Appfile`.

## iOS (`ios-release`)

| Secret | Format | Purpose |
| --- | --- | --- |
| `IOS_DIST_CERT_P12_BASE64` | base64 `.p12` | Apple Distribution certificate and private key, see [Distribution certificate](#distribution-certificate) |
| `IOS_DIST_CERT_P12_PASSWORD` | plain | Password of that `.p12` |
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
| `CI_USER`, `CI_USER_TOKEN` | plain | Bot account that pushes release branches |
| `RN_ENV_PROD` | base64 file | `.env.production` baked into the app |
| `SENTRY_AUTH_TOKEN` | plain | Source map and debug symbol uploads during the native build; without it the iOS build fails |
| `SLACK_RELEASE_WEBHOOK` | plain URL | Posts each release result; a Slack failure never fails the release |

## Distribution certificate

The release lane imports the certificate into a temporary keychain, then fetches the App Store profiles `VeWorld AppStore <bundle id>` with the App Store Connect key, creating them if needed. Before uploading it fails the release unless the signed app's `application-identifier` carries team `RKZMX8AZ6P` and every entitlement from the source `.entitlements` files is present. A different team prefix moves the app's default keychain group, and users would lose their wallets.

The certificate expires after a year. To replace it, an Admin of team `RKZMX8AZ6P`:

1. Creates a key and signing request: `openssl req -new -newkey rsa:2048 -nodes -keyout dist.key -out dist.csr -subj "/CN=VeWorld distribution"`.
2. Creates an **Apple Distribution** certificate from `dist.csr` in the developer portal and downloads it as `distribution.cer`.
3. Bundles and stores it. macOS `security import` rejects the PKCS#12 encryption that OpenSSL 3 and later use by default, hence the explicit algorithms:

   ```sh
   PW=$(openssl rand -base64 24)
   openssl x509 -inform der -in distribution.cer -out dist.pem
   openssl pkcs12 -export -inkey dist.key -in dist.pem -out dist.p12 -passout pass:"$PW" \
     -keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES -macalg sha1
   base64 -i dist.p12 | gh secret set IOS_DIST_CERT_P12_BASE64 --env ios-release --repo vechain/veworld-mobile
   printf %s "$PW" | gh secret set IOS_DIST_CERT_P12_PASSWORD --env ios-release --repo vechain/veworld-mobile
   rm dist.key dist.csr dist.pem dist.p12 distribution.cer
   ```

The next release replaces the profiles, deleting same-named ones that don't include the new certificate.

## Rotating a secret

```sh
# Environment secret
gh secret set IOS_ASC_KEY_ID --env ios-release --repo vechain/veworld-mobile
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
