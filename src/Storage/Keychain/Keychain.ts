import * as SecureStore from "expo-secure-store"

export async function set(encKey: string, options: any, keychainKey: string) {
    await SecureStore.setItemAsync(keychainKey, encKey, options)
}

export async function get(
    options: any,
    keychainKey: string,
): Promise<string | null> {
    return await SecureStore.getItemAsync(keychainKey, options)
}
