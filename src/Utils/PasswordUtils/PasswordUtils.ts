import crypto from "react-native-quick-crypto"
import { blake2b256 } from "thor-devkit"
const Buffer = require("@craftzdog/react-native-buffer").Buffer

const hash = (encryptionKey: string, salt?: string) => {
    if (salt) {
        return hashWithSalt(encryptionKey, salt)
    }

    return crypto.createHash("sha256").update(encryptionKey).digest("hex").substring(0, 32)
}

const hashWithSalt = (password: string, salt: string): string => {
    const passwordHash = blake2b256(password).toString()

    return blake2b256(passwordHash.concat(salt)).toString("hex").substring(0, 32)
}

const getIV = () => [37, 45, 216, 96, 97, 60, 157, 185, 144, 236, 35, 8, 65, 166, 177, 238] as unknown as ArrayBuffer

const getRandomIV = (byteCount: number = 16) => {
    const buffer = crypto.randomBytes(byteCount)
    return new Uint8Array(buffer)
}

const bufferToBase64 = (buffer: Uint8Array) => {
    return new Buffer(buffer).toString("base64")
}

const base64ToBuffer = (base64: string) => {
    const buf = new Buffer.from(base64, "base64")
    return new Uint8Array(buf)
}

export default {
    hash,
    getIV,
    getRandomIV,
    bufferToBase64,
    base64ToBuffer,
}
