import { EncryptionKey } from "~Model/EncryptionKey"
import EncryptedStore from "../EncryptedStore"

const KEY = "veworld-encryption-key"

export default new EncryptedStore<EncryptionKey>(KEY)
