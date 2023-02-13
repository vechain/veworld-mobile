import { Keychain } from "~Storage"
import { error } from "~Common"

const getEncryptionKey = async (
    deviceIndex: number,
    accessControl?: boolean,
) => {
    try {
        return await Keychain.get(deviceIndex, accessControl)
    } catch (err) {
        error(err)
    }
}

const setEncryptionKey = async (
    Enckey: string,
    deviceIndex: number,
    accessControl?: boolean,
) => {
    try {
        await Keychain.set(Enckey, deviceIndex, accessControl)
    } catch (err) {
        error(err)
    }
}

export default {
    getEncryptionKey,
    setEncryptionKey,
}
