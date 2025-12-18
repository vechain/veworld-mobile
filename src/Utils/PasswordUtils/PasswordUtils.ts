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

/*
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const buffer = new ArrayBuffer(binary.length)
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return buffer
}

async function getIV(length: number = 16): Promise<ArrayBuffer> {
    let iv: string | null = await Keychain.get({
        key: "IV_STORE_KEY",
    })

    if (!iv) {
        const array = new Uint8Array(length)
        for (let i = 0; i < length; i++) {
            array[i] = Math.floor(Math.random() * 256)
        }

        iv = arrayBufferToBase64(array.buffer)
        await Keychain.set({
            key: IV_STORE_KEY,
            value: iv,
        })
    }

    return base64ToArrayBuffer(iv)
}
*/

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
