import { HDNode } from "thor-devkit"
import crypto from "react-native-quick-crypto"
import { XPub } from "~Model/Crypto"
import PasswordUtils from "../PasswordUtils"
import HexUtils from "../HexUtils"
import { Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
import stringify from "json-stringify-safe"

export const xPubFromHdNode = (hdNode: HDNode): XPub => {
    return {
        publicKey: hdNode.publicKey.toString("hex"),
        chainCode: hdNode.chainCode.toString("hex"),
    }
}

export const hdNodeFromXPub = (xPub: XPub) => {
    return HDNode.fromPublicKey(
        Buffer.from(xPub.publicKey, "hex"),
        Buffer.from(xPub.chainCode, "hex"),
    )
}

//Alternative to `Math.random()` that returns a cryptographically secure random number
export const random = () => {
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    return arr[0] * Math.pow(2, -32)
}

//schwartzian transform implmenetation O(nlogn), very good for small arrays
export function shuffleArray<T>(arr: T[]) {
    return arr
        .map(value => ({ value, sort: random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

export function encrypt<T>(data: T, encryptionKey: string): string {
    const key = PasswordUtils.hash(encryptionKey)
    const iv = PasswordUtils.getIV()
    const cipher = crypto.createCipheriv("aes256", key, iv)
    let ciph = cipher.update(JSON.stringify(data), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

export function decrypt<T>(data: string, encryptionKey: string): T {
    const key = PasswordUtils.hash(encryptionKey)
    const iv = PasswordUtils.getIV()
    const decipher = crypto.createDecipheriv("aes256", key, iv)
    let txt = decipher.update(data, "hex", "utf-8")
    txt += decipher.final("utf-8")
    let txtToString = txt.toString()
    let parsed = JSON.parse(txtToString)
    return parsed
}

export function encryptState<T>(data: T, key: string): string {
    const cipher = crypto.createCipheriv("aes256", key, null)
    let ciph = cipher.update(stringify(data), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

export function decryptState(data: string, key: string) {
    const decipher = crypto.createDecipheriv("aes256", key, null)
    let txt = decipher.update(data, "hex", "utf-8")
    txt += decipher.final("utf-8")
    let txtToString = txt.toString()
    return txtToString as string
}

export const verifyMnemonic = (seed: string) => {
    let hdNode
    try {
        hdNode = HDNode.fromMnemonic(seed.split(" "))
    } catch (error) {
        console.log(error)
    }
    return hdNode ? true : false
}

/**
 * Encrypt new wallet and insert encryptionKey in keychain
 * @param wallet
 * @param deviceIndex
 * @param accessControl
 * @param hashEncryptionKey if provided, it is used to hash the encyptionKey (after being used to encypt the wallet)
 * @returns
 */

export const encryptWallet = async (
    wallet: Wallet,
    deviceIndex: number,
    accessControl: boolean,
    hashEncryptionKey?: string,
) => {
    let encryptionKey = HexUtils.generateRandom(8)
    let encryptedWallet = encrypt<Wallet>(wallet, encryptionKey)

    if (hashEncryptionKey)
        encryptionKey = encrypt<string>(encryptionKey, hashEncryptionKey)

    await KeychainService.setEncryptionKey(
        encryptionKey,
        deviceIndex,
        accessControl,
    )
    return { encryptionKey, encryptedWallet }
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
    verifyMnemonic,
    encryptWallet,
}
