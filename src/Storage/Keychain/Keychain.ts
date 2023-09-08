import * as SecureStore from "expo-secure-store"
import { SecureStoreOptions } from "expo-secure-store/src/SecureStore"

export async function set(
    encKey: string,
    options: SecureStoreOptions,
    keychainKey: string,
) {
    await SecureStore.setItemAsync(keychainKey, encKey, options)
}

export async function get(
    options: SecureStoreOptions,
    keychainKey: string,
): Promise<string | null> {
    return await SecureStore.getItemAsync(keychainKey, options)
}

export async function deleteItem(key: string, options: SecureStoreOptions) {
    return await SecureStore.deleteItemAsync(key, options)
}
