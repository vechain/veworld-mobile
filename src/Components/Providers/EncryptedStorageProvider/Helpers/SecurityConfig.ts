import { SecurityLevelType } from "~Model"
import { MMKV } from "react-native-mmkv"

/**
 * SecurityStore is used to store the security level of the app
 */

const SecurityStore = new MMKV({
    id: "SecurityStore",
})

const SECURITY_CONFIG_KEY = "SECURITY_CONFIG_KEY"

const set = (type: SecurityLevelType) =>
    SecurityStore.set(SECURITY_CONFIG_KEY, type)

const get = (): SecurityLevelType => {
    const type = SecurityStore.getString(SECURITY_CONFIG_KEY)

    if (!type) throw new Error("No security level found")

    return type as SecurityLevelType
}

const remove = () => SecurityStore.delete(SECURITY_CONFIG_KEY)

export default { set, get, remove }
