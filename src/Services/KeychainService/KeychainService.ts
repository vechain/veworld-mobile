import { KeychainStore } from "~Storage/Stores"
import { error } from "~Common"

const getEncryptionKey = async (accessControl: boolean) => {
    try {
        return await KeychainStore.get(accessControl)
    } catch (err) {
        error(err)
    }
}

const setEncryptionKey = async (Enckey: string, accessControl: boolean) => {
    try {
        await KeychainStore.set(Enckey, accessControl)
    } catch (err) {
        error(err)
    }
}

const removeEncryptionKey = async () => {
    try {
        await KeychainStore.remove()
    } catch (err) {
        error(err)
    }
}

export default {
    getEncryptionKey,
    setEncryptionKey,
    removeEncryptionKey,
}
