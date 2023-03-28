import { HDNode } from "thor-devkit"
import crypto from "react-native-quick-crypto"
import { XPub } from "~Model/Crypto"
import PasswordUtils from "../PasswordUtils"
import HexUtils from "../HexUtils"
import { Device, Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
import stringify from "json-stringify-safe"

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
    return txtToString as string
}

const verifyMnemonic = (seed: string) => {
    let hdNode
    try {
        hdNode = HDNode.fromMnemonic(seed.split(" "))
    } catch (error) {
        console.log(error)
    }
    return hdNode ? true : false
}

/**
 * Encrypt new wallet and insert mnemonic in keychain
 * @param wallet
 * @param deviceIndex
 * @param accessControl
 * @param hashEncryptionKey if provided, it is used to hash the encryptionKey (after being used to encrypt the wallet)
 * @returns
 */

const encryptWallet = async ({
    wallet,
    rootAddress,
    accessControl,
    hashEncryptionKey,
}: {
    wallet: Wallet
    rootAddress: string
    accessControl: boolean
    hashEncryptionKey?: string
}) => {
    let encryptionKey = HexUtils.generateRandom(8)
    let encryptedWallet = encrypt<Wallet>(wallet, encryptionKey)

    if (hashEncryptionKey)
        encryptionKey = encrypt<string>(encryptionKey, hashEncryptionKey)

    await KeychainService.setDeviceEncryptionKey(
        encryptionKey,
        rootAddress,
        accessControl,
    )
    return { encryptionKey, encryptedWallet }
}

/**
 *  Decrypt wallet, pass password if the authentication is password
 * @param  {Device} device
 * @param  {string} password? if the authentication is password
 * @returns Wallet
 */
const decryptWallet = async ({
    device,
    userPassword,
}: {
    device: Device
    userPassword?: string
}) => {
    let encryptedEncryptionKey = await KeychainService.getDeviceEncryptionKey(
        device.rootAddress,
        true,
    )
    if (!encryptedEncryptionKey)
        throw new Error(
            `encryption key for device ${device.rootAddress} not found`,
        )
    let encryptionKey
    if (userPassword) {
        const hashedUserPassword = PasswordUtils.hash(userPassword)
        encryptionKey = decrypt<string>(
            encryptedEncryptionKey,
            hashedUserPassword,
        )
    } else encryptionKey = encryptedEncryptionKey

    const decryptedWallet = decrypt<Wallet>(device.wallet, encryptionKey)

    return { encryptionKey, decryptedWallet }
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
    decryptWallet,
}
