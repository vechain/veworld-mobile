/**
 * An interface for interacting with Chrome Local Storage APIs
 */

export interface Store<T> {
    unlock: {
        (encryptionKey: string): void
    }
    lock: {
        (): void
    }
    exists: {
        (): Promise<boolean>
    }
    get: {
        (): Promise<T>
    }
    getEncrypted: {
        (): Promise<string | undefined>
    }
    insert: {
        (data: T): Promise<void>
    }
    update: {
        (updates: ((data: T) => Promise<void> | void)[]): Promise<T>
    }
    updateEncrypted: {
        (dataEncrypted: string): Promise<void>
    }
    changeEncryptionKey: {
        (newKey: string): Promise<void>
    }
    clear: {
        (): Promise<void>
    }
    checkEncryptionKey: {
        (encryptionKey: string): Promise<boolean>
    }
    acquireMutex: {
        (): Promise<() => void>
    }
}
