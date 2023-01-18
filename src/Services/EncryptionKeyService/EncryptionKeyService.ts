import { debug, error, veWorldErrors } from "~Common"
import { EncryptionKey } from "~Model"
import { EncryptionKeyStore } from "~Storage/Stores"

const get = async (): Promise<EncryptionKey> => await EncryptionKeyStore.get()

const update = async (encryptionKey: EncryptionKey) => {
    debug("Updating encryption key")

    try {
        await EncryptionKeyStore.insert(encryptionKey)
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to set encryption key",
        })
    }
}

const reset = async () => {
    debug("Resetting encryption key")

    try {
        await EncryptionKeyStore.clear()
        // TODO: Do we need it? NOt ported
        // await AutoUnlockKeyService.reset()
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to reset encryption key",
        })
    }
}

const changeEncryptionKey = async (newKey: string) => {
    debug("Changing encryption key")

    return EncryptionKeyStore.changeEncryptionKey(newKey)
}

const lock = () => EncryptionKeyStore.lock()

const unlock = (key: string) => EncryptionKeyStore.unlock(key)

const exists = async (): Promise<boolean> => await EncryptionKeyStore.exists()

const checkEncryptionKey = async (encryptionKey: string): Promise<boolean> => {
    debug("Checking encryption key")
    return await EncryptionKeyStore.checkEncryptionKey(encryptionKey)
}

export default {
    update,
    get,
    reset,
    unlock,
    lock,
    exists,
    checkEncryptionKey,
    changeEncryptionKey,
}
