import { WalletStorageData } from "~Model/Wallet"
import EncryptedStore from "../EncryptedStore"

const WALLET_KEY = "vechain-wallet"
export default new EncryptedStore<WalletStorageData>(WALLET_KEY)
