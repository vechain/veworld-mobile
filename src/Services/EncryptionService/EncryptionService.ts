import crypto from "react-native-quick-crypto"
import { createTransform } from "redux-persist"
import type { TransformConfig } from "redux-persist/lib/createTransform"
import { CryptoUtils } from "~Utils"
import KeychainService from "~Services/KeychainService"

export interface EncryptTransformConfig {
    secretKey: string
    onError: (err: string) => void
}

const makeError = (message: string) => new Error(`redux-persist-transform-encrypt: ${message}`)

export const encryptTransform = <HSS, S = any, RS = any>(
    config: EncryptTransformConfig,
    transformConfig?: TransformConfig,
) => {
    if (typeof config === "undefined") {
        throw makeError("No configuration provided.")
    }

    const { secretKey, onError } = config

    const fail = (message: string): never => {
        onError(message)
        throw makeError(message)
    }

    if (!secretKey) {
        throw makeError("No secret key provided.")
    }

    return createTransform<HSS, string, S, RS>(
        (inboundState, _key) => CryptoUtils.encryptState<HSS>(inboundState, secretKey),

        (outboundState, _key) => {
            if (typeof outboundState !== "string") {
                return fail("Expected outbound state to be a string.")
            }

            let decryptedString: string
            try {
                decryptedString = CryptoUtils.decryptState(outboundState, secretKey)
            } catch {
                return fail("Could not decrypt state. Please verify that you are using the correct secret key.")
            }

            if (!decryptedString) return fail("Decrypted string is empty.")

            try {
                return JSON.parse(decryptedString)
            } catch {
                return fail("Failed to parse decrypted state as JSON.")
            }
        },
        transformConfig,
    )
}

export const initEncryption = async (keyId: string) => {
    const encKey = await KeychainService.getKey(keyId)
    if (encKey) {
        return encKey
    } else {
        const keyHex = createKey()
        await KeychainService.setKey(keyId, keyHex)
        return keyHex
    }
}

const createKey = () => {
    const arr = new Uint8Array(64)
    const keyBuff = crypto.getRandomValues(arr)
    return Buffer.from(keyBuff).toString("hex")
}
