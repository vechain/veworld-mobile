import { DeviceStorageData } from "~Model/Device"
import EncryptedStore from "../EncryptedStore"

const KEY = "veworld-devices"

export default new EncryptedStore<DeviceStorageData>(KEY)
