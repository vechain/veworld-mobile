## EncryptedStorageContext

- EncryptedStorageContext - Leverage `WALLET_STATUS` instead of `WalletStauts`
- ~~Decrypting Wallets -> Probably big changes here, signing not tested yet~~
    - Testing sending simple transaction
    - Need to do more tests. Certificates, delegation, etc.
- Create a standalone unlock screen for pincodes. See `TODO`s in `EncryptedStorageContext`
- Unify Wallets and Redux Keys
    - Currently, wallets and redux encryption keys and both encrypted with the pincodes. This can lead to problems if we
      update 1 and not the other.
- Update Pin Code (Security Settings)
- Switch Bio to PIN (Security Settings)
- Switch PIN to Bio (Security Settings)
- `userPreferences` should not be encrypted so we can access it on the unlock screen.
- Unlock with biometrics -> prompted multiple times. The following point may help
- `SecurityProvider` should probably get removed now, since all security is handled by root Provider
- `PinCodeProvider` can probably get removed now as well
- `useAppReset` -> navigate to Welcome screen on reset
- Need to fix the NFT Slice. See this
  commit: https://github.com/vechainfoundation/veworld-mobile/commit/33f6fc6ab4ad7d3b29727e04f92368e7e1b07c62
- Remove old app data. It can be constructed by:

```typescript
/**
 * Creates a new MMKV instance with the given Configuration. If no custom id is supplied, 'mmkv.default' will be used.
 */
const OldAppStorage = new MMKV({ id: "mmkv.default" }) 
```
