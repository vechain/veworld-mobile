import { Settings } from "~Model"
import { EncryptedStore } from "../EncryptedStore"

const SETTINGS_KEY = "veworld-settings"

export default new EncryptedStore<Settings>(SETTINGS_KEY)
