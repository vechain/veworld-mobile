import { Storage } from "redux-persist"
import { MMKV } from "react-native-mmkv"

export const _storage = new MMKV()

export const storage: Storage = {
    setItem: (key, value) => {
        _storage.set(key, value)
        return Promise.resolve(true)
    },
    getItem: key => {
        const value = _storage.getString(key)
        return Promise.resolve(value)
    },
    removeItem: key => {
        _storage.delete(key)
        return Promise.resolve()
    },
}
