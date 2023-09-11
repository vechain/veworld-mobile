import { Storage } from "redux-persist"
import { MMKV } from "react-native-mmkv"

export const newStorage = (mmkv: MMKV): Storage => ({
    setItem: (key, value) => {
        mmkv.set(key, value)
        return Promise.resolve(true)
    },
    getItem: key => {
        const value = mmkv.getString(key)
        return Promise.resolve(value)
    },
    removeItem(key: string): any {
        mmkv.delete(key)
        return Promise.resolve()
    },
})
