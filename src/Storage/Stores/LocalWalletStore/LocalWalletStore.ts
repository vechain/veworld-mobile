import { WalletStorageData } from "~Model"
import { EncryptedStore } from "../EncryptedStore"

const WALLET_KEY = "vechain-wallet"
export default new EncryptedStore<WalletStorageData>(WALLET_KEY)
