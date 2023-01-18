import { EncryptionKey } from "~Model"
import { EncryptedStore } from "../EncryptedStore"

const KEY = "veworld-encryption-key"

export default new EncryptedStore<EncryptionKey>(KEY)
