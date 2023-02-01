import { HDNode } from "thor-devkit"
import crypto from "react-native-quick-crypto"
import { XPub } from "~Model/Crypto"
import { Wallet } from "~Model"

/*
    https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options

    Initialization vectors should be unpredictable and unique; ideally, they will be cryptographically random. They do not have to be secret: IVs are typically just added to ciphertext messages unencrypted. It may sound contradictory that something has to be unpredictable and unique, but does not have to be secret; remember that an attacker must not be able to predict ahead of time what a given IV will be.
*/
const buf = Buffer.alloc(16)
const iv = crypto.randomFillSync(buf)

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
    let key = crypto
        .createHash("sha256")
        .update(encryptionKey)
        .digest("hex")
        .substr(0, 32)

    const cipher = crypto.createCipheriv("aes256", key, iv)
    let ciph = cipher.update(JSON.stringify(wallet), "utf-8", "hex")
    ciph += cipher.final("hex")
    return ciph as string
}

export function decrypt<T>(encryptedWalet: string, encryptionKey: string): T {
    let key = crypto
        .createHash("sha256")
        .update(encryptionKey)
        .digest("hex")
        .substr(0, 32)
    const decipher = crypto.createDecipheriv("aes256", key, iv)
    let txt = decipher.update(encryptedWalet, "hex", "utf-8")
    txt += decipher.final("utf-8")
    let txtToString = txt.toString()
    let parsed = JSON.parse(txtToString)
    return parsed
}

export const varifySeedPhrase = (seed: string) => {
    let hdNode
    try {
        hdNode = HDNode.fromMnemonic(seed.split(" "))
    } catch (error) {
        console.log(error)
    }
    return hdNode ? true : false
}
