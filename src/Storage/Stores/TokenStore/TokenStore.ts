import { TokenStorageArea } from "~Model/Token"
import EncryptedStore from "../EncryptedStore"

const TOKENS_KEY = "veworld-tokens"

export default new EncryptedStore<TokenStorageArea>(TOKENS_KEY)
