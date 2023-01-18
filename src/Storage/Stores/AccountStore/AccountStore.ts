import { EncryptedStore } from "../EncryptedStore"
import { AccountStorageData } from "~Model"

const ACCOUNTS_KEY = "veworld-accounts"

export default new EncryptedStore<AccountStorageData>(ACCOUNTS_KEY)
