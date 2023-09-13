import { MMKV } from "react-native-mmkv"
import { warn } from "~Utils"
import KeychainService from "~Services/KeychainService"

const OLD_REDUX_KEY = "VeWorld_Redux_key"

const previousStorage = new MMKV({ id: "mmkv.default" })

const clearOldStorage = async () => {
    try {
        const previousKeys = previousStorage.getAllKeys()

        if (previousKeys.length === 0) {
            return
        }

        warn("previousKeys", previousKeys)

        previousStorage.clearAll()

        await KeychainService.deleteKey(OLD_REDUX_KEY)
    } catch (e) {
        warn("Failed to delete previous storage", e)
    }
}

export default {
    clearOldStorage,
}
