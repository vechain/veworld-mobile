import * as SecureStore from "expo-secure-store"
import { SecureStoreOptions } from "expo-secure-store/src/SecureStore"

type Set = {
    key: string
    value: string
    options?: SecureStoreOptions
}

export async function set({ key, value, options = {} }: Set) {
    await SecureStore.setItemAsync(key, value, options)
}

type Get = {
    key: string
    options?: SecureStoreOptions
}

export async function get({ key, options = {} }: Get): Promise<string | null> {
    return await SecureStore.getItemAsync(key, options)
}

type Delete = {
    key: string
    options?: SecureStoreOptions
}

export async function deleteItem({ key, options = {} }: Delete) {
    return await SecureStore.deleteItemAsync(key, options)
}
