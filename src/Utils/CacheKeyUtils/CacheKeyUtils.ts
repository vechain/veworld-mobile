import crypto from "react-native-quick-crypto"

export const createKey = (seed: string) => {
    return crypto.createHash("sha256").update(seed.trim().toLocaleLowerCase()).digest("hex").substring(0, 32)
}
