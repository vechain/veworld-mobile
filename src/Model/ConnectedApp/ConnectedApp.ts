import { StorageData } from "../StorageData"

/**
 * The model for all accounts in chrome storage
 * @field `apps` - An array of connected apps
 */
export interface ConnectedAppStorageData extends StorageData {
    apps: string[]
}
