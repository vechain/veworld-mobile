import { Keychain } from "~Storage"
import { error } from "~Common"

const getEncryptionKey = async (accessControl: boolean) => {
    try {
        return await Keychain.get(accessControl)
    } catch (err) {
        error(err)
    }
}

const setEncryptionKey = async (Enckey: string, accessControl: boolean) => {
    try {
        await Keychain.set(Enckey, accessControl)
    } catch (err) {
        error(err)
    }
}

const removeEncryptionKey = async () => {
    try {
        await Keychain.remove()
    } catch (err) {
        error(err)
    }
}

export default {
    getEncryptionKey,
    setEncryptionKey,
    removeEncryptionKey,
}
