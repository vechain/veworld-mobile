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

// quick-crypto 1.x dropped the plain-array fallback its 0.7 line accepted, and this IV
// feeds the legacy decrypt path that every pre-existing wallet is read through.
const getIV = () => new Uint8Array([37, 45, 216, 96, 97, 60, 157, 185, 144, 236, 35, 8, 65, 166, 177, 238])

const getRandomIV = (byteCount: number = 16) => {
    const buffer = crypto.randomBytes(byteCount)
    return new Uint8Array(buffer)
}

const AES_256_KEY_BYTES = 32
const AES_BLOCK_BYTES = 16

// EVP_BytesToKey (MD5, no salt, one iteration): what quick-crypto 0.7 did with a null IV.
// Reproduced exactly or state written by earlier releases stops decrypting.
const deriveKeyAndIV = (password: string) => {
    const passwordBytes = Buffer.from(password, "utf-8")
    const blocks: Buffer[] = []
    let block = Buffer.alloc(0)
    let derived = 0

    while (derived < AES_256_KEY_BYTES + AES_BLOCK_BYTES) {
        block = crypto
            .createHash("md5")
            .update(Buffer.concat([block, passwordBytes]))
            .digest()
        blocks.push(block)
        derived += block.length
    }

    const material = Buffer.concat(blocks)
    return {
        key: material.subarray(0, AES_256_KEY_BYTES),
        iv: material.subarray(AES_256_KEY_BYTES, AES_256_KEY_BYTES + AES_BLOCK_BYTES),
    }
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
    deriveKeyAndIV,
    bufferToBase64,
    base64ToBuffer,
}
