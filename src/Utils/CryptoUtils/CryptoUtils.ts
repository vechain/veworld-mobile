import { HDNode, Keystore, mnemonic as Mnemonic } from "thor-devkit"
import crypto from "react-native-quick-crypto"
import scrypt from "react-native-scrypt"
import { XPub } from "~Model/Crypto"
import stringify from "json-stringify-safe"
import { error } from "~Utils/Logger"
import { IMPORT_TYPE } from "~Model"
import fastKeystoreDecrypt from "./Helpers/fastKeystoreDecrypt"
import HexUtils from "~Utils/HexUtils"
import { ERROR_EVENTS } from "~Constants"

const N = Buffer.from("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", "hex")
const ZERO = Buffer.alloc(32, 0)
const ZERO_IV = Buffer.alloc(16, 0)

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

async function encrypt<T>(data: T, encryptionKey: string, salt: string, iv: Uint8Array): Promise<string> {
    const _N = 16384
    const r = 8
    const p = 1

    // Derive a 32‑byte key encoded as hex, then convert to a Buffer for quick-crypto 1.x
    const keyHex = await scrypt(Buffer.from(encryptionKey).toString("hex"), salt, _N, r, p, 32, "hex")
    const keyBuf = Buffer.from(keyHex, "hex")
    if (keyBuf.length !== 32) {
        throw new Error("Key is NOT 32 bytes")
    }

    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuf, Buffer.from(iv))
    let ciph = cipher.update(JSON.stringify(data), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

async function decrypt<T>(data: string, encryptionKey: string, salt: string, iv: Uint8Array): Promise<T> {
    const _N = 16384
    const r = 8
    const p = 1

    const keyHex = await scrypt(Buffer.from(encryptionKey).toString("hex"), salt, _N, r, p, 32, "hex")
    const keyBuf = Buffer.from(keyHex, "hex")
    if (keyBuf.length !== 32) {
        throw new Error("Key is NOT 32 bytes")
    }

    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuf, Buffer.from(iv))
    let txt = decipher.update(data, "hex", "utf-8")
    txt += decipher.final("utf-8")
    const parsed = JSON.parse(txt.toString())
    return parsed
}

const normaliseStateKey = (rawKey: string): Buffer => {
    const cleaned = String(rawKey ?? "").trim()
    if (!cleaned) {
        throw new Error("Empty encryption key")
    }

    // 1) Try treating the key as hex (with optional 0x prefix)
    const hexCandidate = cleaned.startsWith("0x") || cleaned.startsWith("0X") ? cleaned.slice(2) : cleaned
    const HEX_RE = /^[0-9a-fA-F]+$/

    const toFixed32 = (buf: Buffer): Buffer => {
        if (buf.length === 32) return buf
        if (buf.length > 32) return buf.subarray(0, 32)
        const out = Buffer.alloc(32)
        buf.copy(out)
        return out
    }

    if (hexCandidate.length > 0 && HEX_RE.test(hexCandidate)) {
        const hexBuf = Buffer.from(hexCandidate, "hex")
        if (hexBuf.length > 0) {
            return toFixed32(hexBuf)
        }
    }

    // 2) Fallback: use UTF‑8 bytes of the key string
    const utfBuf = Buffer.from(cleaned, "utf8")
    if (utfBuf.length === 0) {
        throw new Error("Empty encryption key")
    }
    return toFixed32(utfBuf)
}

function encryptState<T>(data: T, key: string): string {
    const keyBuf = normaliseStateKey(key)
    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuf, ZERO_IV)
    let ciph = cipher.update(stringify(data), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

function decryptState(data: string, key: string) {
    const keyBuf = normaliseStateKey(key)
    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuf, ZERO_IV)
    let txt = decipher.update(data, "hex", "utf-8")
    txt += decipher.final("utf-8")
    return txt.toString()
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
