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

    if (!secretKey) {
        throw makeError("No secret key provided.")
    }

    return createTransform<HSS, string, S, RS>(
        (inboundState, _key) => CryptoUtils.encryptState<HSS>(inboundState, secretKey),

        (outboundState, _key) => {
            if (typeof outboundState !== "string") {
                return onError("redux-persist-transform-encrypt : Expected outbound state to be a string.")
            }

            try {
                const decryptedString = CryptoUtils.decryptState(outboundState, secretKey)

                if (!decryptedString) {
                    throw new Error("Decrypted string is empty.")
                }

                try {
                    return JSON.parse(decryptedString)
                } catch {
                    return onError("redux-persist-transform-encrypt : Failed to parse state as JSON.")
                }
            } catch {
                return onError(
                    // eslint-disable-next-line max-len
                    "redux-persist-transform-encrypt : Could not decrypt state. Please verify that you are using the correct secret key.",
                )
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
    const keyBuff = crypto.getRandomValues(arr) as ArrayBuffer
    return Buffer.from(keyBuff).toString("hex")
}
