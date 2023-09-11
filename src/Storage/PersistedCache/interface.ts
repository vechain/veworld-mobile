export interface SynchronousCache<T> {
    itemExists: (key: string) => boolean
    getItem: (key: string) => T | undefined
    setItem: (key: string, item: T) => void
    removeItem: (key: string) => void
    reset: () => void
    lock: () => void
    unlock: (encryptionKey: string) => void
}
