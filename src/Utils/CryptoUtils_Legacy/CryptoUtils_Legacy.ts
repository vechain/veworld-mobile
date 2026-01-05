import { Keystore } from "thor-devkit"
import crypto from "react-native-quick-crypto"
import PasswordUtils from "../PasswordUtils"
import stringify from "json-stringify-safe"
import { error } from "~Utils/Logger"
import fastKeystoreDecrypt from "./Helpers/fastKeystoreDecrypt"
import HexUtils from "~Utils/HexUtils"
import { ERROR_EVENTS } from "~Constants"
import { Cipher, Decipher } from "crypto"

const ZERO_IV = Buffer.alloc(16, 0)

// [START] - Used for testing purposes ONLY
function encrypt<T>(data: T, encryptionKey: string, salt?: string): string {
    const keyHex = PasswordUtils.hash(encryptionKey, salt)
    const iv = PasswordUtils.getIV()
    const cipher = crypto.createCipheriv("aes-256-cbc", keyHex, iv) as Cipher
    let ciph = cipher.update(JSON.stringify(data), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

function encryptState<T>(data: T, key: string): string {
    const cipher = crypto.createCipheriv("aes-256-cbc", key, ZERO_IV) as Cipher
    let ciph = cipher.update(stringify(data), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}
// [END] - Used for testing purposes ONLY

function decrypt<T>(data: string, encryptionKey: string, salt?: string): T {
    const keyHex = PasswordUtils.hash(encryptionKey, salt)
    const iv = PasswordUtils.getIV()
    const decipher = crypto.createDecipheriv("aes-256-cbc", keyHex, iv) as Decipher
    let txt = decipher.update(data, "hex", "utf-8")
    txt += decipher.final("utf-8")
    let txtToString = txt.toString()
    let parsed = JSON.parse(txtToString)
    return parsed
}

function decryptState(data: string, key: string) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, ZERO_IV) as Decipher
    let txt = decipher.update(data, "hex", "utf-8")
    txt += decipher.final("utf-8")
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
