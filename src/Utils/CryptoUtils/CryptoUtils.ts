import { HDNode, Keystore, mnemonic as Mnemonic } from "thor-devkit"
import crypto from "react-native-quick-crypto"
import { XPub } from "~Model/Crypto"
import PasswordUtils from "../PasswordUtils"
import stringify from "json-stringify-safe"
import { error } from "~Utils/Logger"
import { IMPORT_TYPE } from "~Model"
import fastKeystoreDecrypt from "./Helpers/fastKeystoreDecrypt"
import HexUtils from "~Utils/HexUtils"
import { ERROR_EVENTS } from "~Constants"

const N = Buffer.from("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", "hex")
const ZERO = Buffer.alloc(32, 0)

const xPubFromHdNode = (hdNode: HDNode): XPub => {
    return {
        publicKey: hdNode.publicKey.toString("hex"),
        chainCode: hdNode.chainCode.toString("hex"),
    }
}

const hdNodeFromXPub = (xPub: XPub) => {
    return HDNode.fromPublicKey(Buffer.from(xPub.publicKey, "hex"), Buffer.from(xPub.chainCode, "hex"))
}

//Alternative to `Math.random()` that returns a cryptographically secure random number
const random = () => {
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    return arr[0] * Math.pow(2, -32)
}

//schwartzian transform implmenetation O(nlogn), very good for small arrays
function shuffleArray<T>(arr: T[]) {
    return arr
        .map(value => ({ value, sort: random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

function encrypt<T>(data: T, encryptionKey: string, salt?: string): string {
    const key = PasswordUtils.hash(encryptionKey, salt)
    const iv = PasswordUtils.getIV() // TODO - vas - generate IV
    const cipher = crypto.createCipheriv("aes256", key, iv)
    let ciph = cipher.update(JSON.stringify(data), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

function decrypt<T>(data: string, encryptionKey: string, salt?: string): T {
    const key = PasswordUtils.hash(encryptionKey, salt)
    const iv = PasswordUtils.getIV()
    const decipher = crypto.createDecipheriv("aes256", key, iv)
    let txt = decipher.update(data, "hex", "utf-8")
    txt += decipher.final("utf-8")
    let txtToString = txt.toString()
    let parsed = JSON.parse(txtToString)
    return parsed
}

function encryptState<T>(data: T, key: string): string {
    const cipher = crypto.createCipheriv("aes256", key, null)
    let ciph = cipher.update(stringify(data), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

function decryptState(data: string, key: string) {
    const decipher = crypto.createDecipheriv("aes256", key, null)
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

/**
 * Normalise mnemonic to be lowercase and remove any extra spaces, commas or other delimiting characters
 * @param mnemonic
 */
const mnemonicStringToArray = (seedPhrase: string): string[] =>
    seedPhrase
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")

const isValidPrivateKey = (rawImportData: string): boolean => {
    if (HexUtils.isInvalid(rawImportData)) return false

    const key = Buffer.from(HexUtils.removePrefix(rawImportData), "hex")
    return Buffer.isBuffer(key) && key.length === 32 && !key.equals(ZERO) && key.compare(N) < 0
}

const isValidKeystoreFile = (fileContent: string): boolean => {
    try {
        const parsed = JSON.parse(fileContent)
        return Keystore.wellFormed(parsed)
    } catch (err) {
        return false
    }
}

const determineKeyImportType = (rawImportData: string): IMPORT_TYPE => {
    if (!rawImportData) return IMPORT_TYPE.UNKNOWN

    if (Mnemonic.validate(mnemonicStringToArray(rawImportData))) return IMPORT_TYPE.MNEMONIC
    if (isValidPrivateKey(rawImportData)) return IMPORT_TYPE.PRIVATE_KEY
    if (isValidKeystoreFile(rawImportData)) return IMPORT_TYPE.KEYSTORE_FILE
    return IMPORT_TYPE.UNKNOWN
}

export default {
    xPubFromHdNode,
    hdNodeFromXPub,
    random,
    shuffleArray,
    encrypt,
    decrypt,
    decryptState,
    encryptState,
    decryptKeystoreFile,
    mnemonicStringToArray,
    determineKeyImportType,
}
