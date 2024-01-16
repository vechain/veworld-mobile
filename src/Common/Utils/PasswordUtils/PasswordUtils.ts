import crypto from "react-native-quick-crypto"

const hash = (encryptionKey: string) => {
    let key = crypto
        .createHash("sha256")
        .update(encryptionKey)
        .digest("hex")
        .substring(0, 32)

    return key
}
const getIV = () =>
    [
        37, 45, 216, 96, 97, 60, 157, 185, 144, 236, 35, 8, 65, 166, 177, 238,
    ] as unknown as ArrayBuffer

export default {
    hash,
    getIV,
}
