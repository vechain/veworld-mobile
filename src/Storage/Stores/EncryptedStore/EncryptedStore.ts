import passworder from "@metamask/browser-passworder"
import { Mutex } from "async-mutex"
import { Store } from "../interface"
import { StorageData } from "~Model/StorageData"
import { veWorldErrors } from "~Common/Errors"
import HexUtils from "~Common/Utils/HexUtils"
import { debug, warn, error } from "~Common/Logger/Logger"

// TODO: This class was designed for use in a browser extension. Need to port it to mobile.

/**
 * A class for securely interacting with the chrome storage api
 */
export default class EncryptedStore<T extends StorageData> implements Store<T> {
    private encryptionKey: string | undefined
    private readonly storeKey: string
    private readonly mutex: Mutex

    constructor(storeKey: string) {
        this.storeKey = storeKey
        this.mutex = new Mutex()
    }

    /**
     * Does data exist in this store?
     * @returns boolean
     */
    public async exists(): Promise<boolean> {
        debug(`Checking is store ${this.storeKey} exists`)
        const data = (await chrome.storage.local.get(this.storeKey))[
            this.storeKey
        ]
        return !!data
    }

    /**
     * Tests the given encryptionKey to see if it's valid
     * @param encryptionKey - the key to test
     * @returns boolean
     */
    public async checkEncryptionKey(encryptionKey: string): Promise<boolean> {
        try {
            const dataEncrypted = await this.getEncrypted()

            if (!dataEncrypted) return false

            await passworder.decrypt<string>(encryptionKey, dataEncrypted)
            return true
        } catch (e) {
            return false
        }
    }

    /**
     * Sets the encryptionKey on the object so we don't need to provide it in each call
     * @param encryptionKey - The encryption key to unlock the store
     */
    public unlock(encryptionKey: string) {
        debug(`Unlocking store ${this.storeKey}`)
        this.encryptionKey = encryptionKey
    }

    /**
     * Removes the encryptionKey from the object
     */
    public lock() {
        debug(`Locking store ${this.storeKey}`)
        delete this.encryptionKey
    }

    /**
     * @returns the decrypted data from Chrome Local Storage
     */
    public async get(): Promise<T> {
        // If the key isn't set the wallet is locked
        if (!this.encryptionKey)
            throw veWorldErrors.provider.unauthorized({
                message: `Store with key ${this.storeKey} is locked`,
            })

        const dataEncrypted = await this.getEncrypted()

        // Attempt to decrypt
        return await this.decrypt(dataEncrypted)
    }

    /**
     * @returns the raw encrypted data string from Chrome Local Storage
     */
    public async getEncrypted(): Promise<string | undefined> {
        const result = await chrome.storage.local.get(this.storeKey)

        if (!result || !result[this.storeKey]) {
            warn("Store is empty")
            return
        }

        return result[this.storeKey]
    }

    /**
     * INSERT the provided value to chrome storage.
     * If data already exists, it will be replaced
     *
     * Waits for the store to become unlocked
     *
     * @param data - the data to store
     */
    public async insert(data: T) {
        const release = await this.acquireMutex()

        try {
            if (Array.isArray(data))
                throw Error(
                    "Can't store arrays. Please wrap your array inside an object",
                )

            await this.updateUnEncrypted(data)
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message:
                    "Failed to insert the data into store: " + this.storeKey,
            })
        } finally {
            release()
            debug(`Released mutex on store: ${this.storeKey}`)
        }
    }

    /**
     * UPDATE the current data in the Chrome Local Storage
     *
     * Gets the previous value and applies the given update to that old value.
     * This prevents race conditions while updating storage as the mutex is placed around the
     * retrieval, update and storage.
     *
     * The update MUST mutate the data only. Reassignments do not work
     *
     * Waits for the store to become unlocked
     *
     * @param updates - the array of updates to apply
     */
    public async update(updates: ((data: T) => void | Promise<void>)[]) {
        if (updates.length < 1)
            throw veWorldErrors.rpc.invalidParams({
                message: "There must be at least 1 update",
            })

        const release = await this.acquireMutex()
        let data: T

        try {
            //Get the previous data
            data = await this.get()

            //Apply all updates
            for (const ud of updates) {
                await ud(data)
            }

            //Store the updated data
            await this.updateUnEncrypted(data)
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: `Failed to update the store with key: ${this.storeKey}`,
            })
        } finally {
            release()
            debug(`Released mutex on store: ${this.storeKey}`)
        }
        return data
    }

    /**
     * Replace the raw encrypted data in Chrome Local Storage with the provided value
     * @param dataEncrypted - the encrypted data to store
     */
    public updateEncrypted = async (dataEncrypted: string | undefined) => {
        await chrome.storage.local.set({ [this.storeKey]: dataEncrypted })
    }

    /**
     * Encrypt the data in the Chrome Local Storage using the new key
     *
     * Waits for the store to become unlocked
     *
     * @param newKey - the new encryption key
     */
    public async changeEncryptionKey(newKey: string) {
        const release = await this.acquireMutex()

        try {
            const data = await this.get()
            this.encryptionKey = newKey
            await this.updateUnEncrypted(data)
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to change the encryption key",
            })
        } finally {
            release()
            debug(`Released mutex on store: ${this.storeKey}`)
        }
    }

    /**
     * Remove all data from Chrome Local Storage
     */
    public async clear(): Promise<void> {
        try {
            await chrome.storage.local.remove(this.storeKey)
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                message: `Failed to clear store ${this.storeKey}`,
            })
        }
    }

    /**
     * A mutex for preventing concurrent access to this store
     * @returns a releaseMutex function that should be called when finished updating the store
     */
    public async acquireMutex() {
        while (this.mutex.isLocked()) {
            warn(`Trying to acquire a locked mutex: ${this.storeKey}`)
            await new Promise(r => setTimeout(r, 50))
        }

        const release = await this.mutex.acquire()

        debug(`Acquired a mutex for:  ${this.storeKey}`)

        return release
    }

    private updateUnEncrypted = async (data: T) => {
        // If the key isn't set the wallet is locked
        if (!this.encryptionKey)
            throw veWorldErrors.provider.unauthorized({
                message: `Store with key ${this.storeKey} is locked`,
            })

        //Set the nonce & update time
        const dataEncrypted = await passworder.encrypt(
            this.encryptionKey,
            JSON.stringify({
                ...data,
                nonce: HexUtils.generateRandom(256),
                timeUpdated: Date.now(),
            }),
        )

        await this.updateEncrypted(dataEncrypted)
    }

    /**
     * Decrypt the provided data
     * @param dataEncrypted - the encrypted data
     * @returns the decrypted data
     */
    private async decrypt(dataEncrypted: unknown): Promise<T> {
        // If the key isn't set the store is locked
        if (!this.encryptionKey)
            throw veWorldErrors.provider.unauthorized({
                message: `Store with key ${this.storeKey} is locked`,
            })

        if (typeof dataEncrypted !== "string")
            throw veWorldErrors.rpc.internal({
                message: `Data corrupted in store ${this.storeKey}!`,
            })

        try {
            const json = await passworder.decrypt<string>(
                this.encryptionKey,
                dataEncrypted,
            )

            return JSON.parse(json)
        } catch (e) {
            error(e)
            throw veWorldErrors.provider.unauthorized({
                message: `Failed to decrypt data in store ${this.storeKey}`,
            })
        }
    }
}
