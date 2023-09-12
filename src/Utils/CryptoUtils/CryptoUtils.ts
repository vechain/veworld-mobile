import { HDNode } from "thor-devkit"
import crypto from "react-native-quick-crypto"
import { XPub } from "~Model/Crypto"
import PasswordUtils from "../PasswordUtils"
import stringify from "json-stringify-safe"
import { warn } from "~Utils/Logger"

const xPubFromHdNode = (hdNode: HDNode): XPub => {
    return {
        publicKey: hdNode.publicKey.toString("hex"),
        chainCode: hdNode.chainCode.toString("hex"),
    }
}

const hdNodeFromXPub = (xPub: XPub) => {
    return HDNode.fromPublicKey(
        Buffer.from(xPub.publicKey, "hex"),
        Buffer.from(xPub.chainCode, "hex"),
    )
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

function encrypt<T>(data: T, encryptionKey: string): string {
    const key = PasswordUtils.hash(encryptionKey)
    const iv = PasswordUtils.getIV()
    const cipher = crypto.createCipheriv("aes256", key, iv)
    let ciph = cipher.update(JSON.stringify(data), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

function decrypt<T>(data: string, encryptionKey: string): T {
    const key = PasswordUtils.hash(encryptionKey)
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

const verifyMnemonic = (seed: string) => {
    let hdNode
    try {
        hdNode = HDNode.fromMnemonic(seed.split(" "))
    } catch (e) {
        warn("verifyMnemonic", e)
    }
    return !!hdNode
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
}
