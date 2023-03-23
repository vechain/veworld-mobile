import crypto from "react-native-quick-crypto"
import { createTransform } from "redux-persist"
import type { TransformConfig } from "redux-persist/lib/createTransform"
import { CryptoUtils } from "~Common"
import KeychainService from "~Services/KeychainService"

export interface EncryptTransformConfig {
    secretKey: string
    onError?: (err: Error) => void
}

const makeError = (message: string) =>
    new Error(`redux-persist-transform-encrypt: ${message}`)

export const encryptTransform = <HSS, S = any, RS = any>(
    config: EncryptTransformConfig,
    transformConfig?: TransformConfig,
) => {
    if (typeof config === "undefined") {
        throw makeError("No configuration provided.")
    }

    const { secretKey } = config

    if (!secretKey) {
        throw makeError("No secret key provided.")
    }

    const onError =
        typeof config.onError === "function" ? config.onError : console.warn

    return createTransform<HSS, string, S, RS>(
        (inboundState, _key) =>
            CryptoUtils.encryptState<HSS>(inboundState, secretKey),

        (outboundState, _key) => {
            if (typeof outboundState !== "string") {
                return onError(
                    makeError("Expected outbound state to be a string."),
                )
            }

            try {
                const decryptedString = CryptoUtils.decryptState(
                    outboundState,
                    secretKey,
                )

                if (!decryptedString) {
                    throw new Error("Decrypted string is empty.")
                }

                try {
                    return JSON.parse(decryptedString)
                } catch {
                    return onError(makeError("Failed to parse state as JSON."))
                }
            } catch {
                return onError(
                    makeError(
                        "Could not decrypt state. Please verify that you are using the correct secret key.",
                    ),
                )
            }
        },
        transformConfig,
    )
}

export const initEncryption = async () => {
    const encKey = await KeychainService.getReduxmKey()
    if (encKey) {
        return encKey
    } else {
        const keyHex = createKey()
        await KeychainService.setReduxKey(keyHex)
        return keyHex
    }
}

const createKey = () => {
    const arr = new Uint8Array(64)
    const keyBuff = crypto.getRandomValues(arr) as ArrayBuffer
    return Buffer.from(keyBuff).toString("hex")
}
