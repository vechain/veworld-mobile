import { StorageEncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import EncryptionKeyHelper from "./EncryptionKeyHelper"

export const get = async (pinCode?: string): Promise<StorageEncryptionKeys> => {
    const { redux, images, metadata } = await EncryptionKeyHelper.get(pinCode)

    return {
        redux,
        images,
        metadata,
    }
}

export default {
    get,
}
