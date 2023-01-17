import { ActivityStorageData } from "~Model/Activity"
import EncryptedStore from "../EncryptedStore/EncryptedStore"

const ACTIVITIES_KEY = "veworld-activity"

export default new EncryptedStore<ActivityStorageData>(ACTIVITIES_KEY)
