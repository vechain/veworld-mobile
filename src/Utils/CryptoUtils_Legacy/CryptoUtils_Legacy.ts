import { Keystore } from "thor-devkit"
import crypto from "react-native-quick-crypto"
import PasswordUtils from "../PasswordUtils"
import stringify from "json-stringify-safe"
import { error } from "~Utils/Logger"
import fastKeystoreDecrypt from "./Helpers/fastKeystoreDecrypt"
import HexUtils from "~Utils/HexUtils"
import { ERROR_EVENTS } from "~Constants"

const ALGORITHM_STATE = "aes256"
const ENCRYPT_OUTPUT_ENCODING = "hex"
const DECRYPT_INPUT_ENCODING = ENCRYPT_OUTPUT_ENCODING
const UTF8 = "utf8"

// [START] - Used for testing purposes ONLY
function encrypt<T>(data: T, encryptionKey: string, salt?: string): string {
    const key = PasswordUtils.hash(encryptionKey, salt)
    const iv = PasswordUtils.getIV()
    const cipher = crypto.createCipheriv(ALGORITHM_STATE, key, iv)
    let ciph = cipher.update(
        JSON.stringify(data),
        // @ts-ignore
        UTF8,
        ENCRYPT_OUTPUT_ENCODING,
    )
    if (typeof ciph !== "string") {
        throw new Error("Cipher is not a string")
    }
    ciph += cipher.final(ENCRYPT_OUTPUT_ENCODING)
    return ciph as string
}

function encryptState<T>(data: T, key: string): string {
    const cipher = crypto.createCipheriv(ALGORITHM_STATE, key, null)
    let ciph = cipher.update(
        stringify(data),
        // @ts-ignore
        UTF8,
        ENCRYPT_OUTPUT_ENCODING,
    )
    if (typeof ciph !== "string") {
        throw new Error("Cipher is not a string")
    }
    ciph += cipher.final(ENCRYPT_OUTPUT_ENCODING)
    return ciph as string
}
// [END] - Used for testing purposes ONLY

function decrypt<T>(data: string, encryptionKey: string, salt?: string): T {
    const key = PasswordUtils.hash(encryptionKey, salt)
    const iv = PasswordUtils.getIV()
    const decipher = crypto.createDecipheriv(ALGORITHM_STATE, key, iv)
    let txt = decipher.update(
        data,
        // @ts-ignore
        DECRYPT_INPUT_ENCODING,
        UTF8,
    )
    if (typeof txt !== "string") {
        throw new Error("Decrypted text is not a string")
    }
    txt += decipher.final(UTF8)
    let txtToString = txt.toString()
    let parsed = JSON.parse(txtToString)
    return parsed
}

function decryptState(data: string, key: string) {
    const decipher = crypto.createDecipheriv(ALGORITHM_STATE, key, null)
    let txt = decipher.update(
        data,
        // @ts-ignore
        DECRYPT_INPUT_ENCODING,
        UTF8,
    )
    if (typeof txt !== "string") {
        throw new Error("Decrypted text is not a string")
    }
    txt += decipher.final(UTF8)
    let txtToString = txt.toString()
    return txtToString
}

const decryptKeystoreFile = async (ks: Keystore | string, key: string): Promise<string> => {
    try {
        const keystore: Keystore = typeof ks === "string" ? JSON.parse(ks) : ks
        if (!Keystore.wellFormed(keystore)) throw Error("Invalid keystore")

        // const pk = await Keystore.decrypt(keystore, key)
        const keystoreAccount = await fastKeystoreDecrypt(JSON.stringify(keystore), key)
        return HexUtils.removePrefix(keystoreAccount.privateKey)
    } catch (err) {
        error(ERROR_EVENTS.ENCRYPTION, err)
        throw err
    }
}

export default {
    encrypt,
    decrypt,
    decryptState,
    encryptState,
    decryptKeystoreFile,
}
