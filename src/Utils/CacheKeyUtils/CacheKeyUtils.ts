import crypto from "react-native-quick-crypto"

export const createKey = (seed: string) => {
    const hashBuffer = crypto.createHash("sha256").update(seed.trim().toLocaleLowerCase()).digest()
    return hashBuffer.toString("hex").substring(0, 32)
}
