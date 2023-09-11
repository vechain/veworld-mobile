## EncryptedStorageContext

- EncryptedStorageContext - Leverage `WALLET_STATUS` instead of `WalletStauts`
- Decrypting Wallets -> Probably big changes here, signing not tested yet
- Create a standalone unlock screen for pincodes. See `TODO`s in `EncryptedStorageContext`
- Update Pin Code (Security Settings)
- Switch Bio to PIN (Security Settings)
- Switch PIN to Bio (Security Settings)
- `userPreferences` should not be encrypted so we can access it on the unlock screen.
- `SecurityProvider` should probably get removed now, since all security is handled by root Provider
- `PinCodeProvider` can probably get removed now as well
- Need to fix the NFT Slice. See this
  commit: https://github.com/vechainfoundation/veworld-mobile/commit/33f6fc6ab4ad7d3b29727e04f92368e7e1b07c62
- Remove old app data. It can be constructed by:

```typescript
/**
 * Creates a new MMKV instance with the given Configuration. If no custom id is supplied, 'mmkv.default' will be used.
 */
const OldAppStorage = new MMKV({ id: "mmkv.default" }) 
```
