import { useCallback } from "react"
import { NativeModules } from "react-native"

const { CryptoKitManager } = NativeModules

export const useCryptoKit = () => {
    /**
     * Generate a key pair for the VeWorld wallet and store it in the keychain
     * @returns The public key as a base64 encoded string
     */
    const generateKeyPair = useCallback(async () => {
        const keyPair = await CryptoKitManager.generateKeyPair()
        return keyPair.publicKey as string
    }, [])

    /**
     * Create a shared secret between the VeWorld wallet private key and the external app public key
     * @param publicKey - The public key of the external app
     * @returns The shared secret as a base64 encoded string
     */
    const createSharedSecret = useCallback(async (publicKey: string) => {
        const privateKey = ""
        const sharedSecret = await CryptoKitManager.deriveSharedSecret(privateKey, publicKey)
        return sharedSecret.sharedSecret as string
    }, [])

    /**
     * Encrypt a message using a shared secret
     * @param data - The data to encrypt
     * @param sharedSecret - The shared secret to encrypt the data
     * @returns The encrypted data as a base64 encoded string and the nonce as a base64 encoded string
     */
    const encrypt = useCallback(
        async (data: string, sharedSecret: string): Promise<{ encrypted: string; nonce: string }> => {
            const encrypted = await CryptoKitManager.encrypt(data, sharedSecret)
            return encrypted as { encrypted: string; nonce: string }
        },
        [],
    )

    /**
     * Decrypt a message using a shared secret
     * @param encrypted - The encrypted data as a base64 encoded string
     * @param sharedSecret - The shared secret to decrypt the data
     * @param nonce - The nonce as a base64 encoded string
     * @returns The decrypted data as a string
     */
    const decrypt = useCallback(async (encrypted: string, sharedSecret: string, nonce: string): Promise<string> => {
        const decrypted = await CryptoKitManager.decrypt(encrypted, sharedSecret, nonce)
        return decrypted.decrypted as string
    }, [])

    return { generateKeyPair, createSharedSecret, encrypt, decrypt }
}
