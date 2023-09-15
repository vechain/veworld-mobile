import crypto from "react-native-quick-crypto"
import { blake2b256 } from "thor-devkit"

const hash = (encryptionKey: string, salt?: string) => {
    if (salt) {
        return hashWithSalt(encryptionKey, salt)
    }

    return crypto
        .createHash("sha256")
        .update(encryptionKey)
        .digest("hex")
        .substring(0, 32)
}

const hashWithSalt = (password: string, salt: string): string => {
    const passwordHash = blake2b256(password).toString()

    return blake2b256(passwordHash.concat(salt))
        .toString("hex")
        .substring(0, 32)
}

const getIV = () =>
    [
        37, 45, 216, 96, 97, 60, 157, 185, 144, 236, 35, 8, 65, 166, 177, 238,
    ] as unknown as ArrayBuffer

export default {
    hash,
    getIV,
}
