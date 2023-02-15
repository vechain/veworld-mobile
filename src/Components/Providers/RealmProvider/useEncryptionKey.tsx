import { useCallback, useState } from "react"
import crypto from "react-native-quick-crypto"
import KeychainService from "~Services/KeychainService"

export const useEncryptionKey = () => {
    const [buffKey, setBuffKey] = useState<ArrayBuffer | undefined>()
    const [isKey, setIsKey] = useState(false)

    const getKey = useCallback(async (encKey: string) => {
        const key64 = Buffer.from(encKey, "base64")
        const keyToArr = new Uint8Array(key64)

        process.env.NODE_ENV === "development" &&
            console.log("Realm Encryption key : ", key64.toString("hex"))

        setBuffKey(keyToArr)
        setIsKey(true)
    }, [])

    const createKey = useCallback(async () => {
        const arr = new Uint8Array(64)
        const keyBuff = crypto.getRandomValues(arr) as ArrayBuffer
        const key64: string = Buffer.from(keyBuff).toString("base64")
        await KeychainService.setRealmKey(key64)
        setBuffKey(keyBuff)
        setIsKey(true)
    }, [])

    return { getKey, createKey, isKey, buffKey }
}
