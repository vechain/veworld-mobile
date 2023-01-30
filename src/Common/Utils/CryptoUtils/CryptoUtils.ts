import { HDNode } from "thor-devkit"
import crypto from "react-native-quick-crypto"
import { XPub } from "~Model/Crypto"
import { Wallet } from "~Model"

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

export const encrypt = (wallet: Wallet, encryptionKey: string) => {
    const cipher = crypto.createCipher("aes256", encryptionKey)
    let ciph = cipher.update(JSON.stringify(wallet), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

export function decrypt<T>(encryptedWalet: string, encryptionKey: string): T {
    const decipher = crypto.createDecipher("aes256", encryptionKey)
    let txt = decipher.update(encryptedWalet, "hex", "utf-8")
    txt += decipher.final("utf-8")
    let txtToString = txt.toString()
    let parsed = JSON.parse(txtToString)
    return parsed
}

export const getRandomKey = () => crypto.randomUUID()
