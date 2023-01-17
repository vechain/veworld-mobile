/**
 * @field `timeUpdated` - The time the data was updated in seconds
 * @field `nonce` - A random string to provide extra entropy
 */
export interface StorageData {
    timeUpdated?: number
    nonce?: string
}
