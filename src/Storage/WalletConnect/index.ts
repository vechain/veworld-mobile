import { MMKV } from "react-native-mmkv"
import { IKeyValueStorage } from "@walletconnect/keyvaluestorage/dist/cjs/shared"

import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json"

const mmkv = new MMKV({ id: "wallet-connect-storage" })

export function parseEntry(entry: [string, string | null]): [string, any] {
    return [entry[0], safeJsonParse(entry[1] ?? "")]
}

export class VeWorldWCStorage implements IKeyValueStorage {
    async getKeys(): Promise<string[]> {
        return mmkv.getAllKeys()
    }

    async getEntries<T = any>(): Promise<[string, T][]> {
        const keys = await this.getKeys()

        const res: [string, T][] = []

        for (const key of keys) {
            const value = mmkv.getString(key)

            if (!value) continue

            res.push(parseEntry([key, value]))
        }

        return res
    }

    async getItem<T = any>(key: string): Promise<T | undefined> {
        const value = mmkv.getString(key)

        if (!value) return undefined

        return safeJsonParse(value) as T
    }

    async setItem<T = any>(key: string, value: T): Promise<void> {
        mmkv.set(key, safeJsonStringify(value))
    }

    async removeItem(key: string): Promise<void> {
        mmkv.delete(key)
    }
}
