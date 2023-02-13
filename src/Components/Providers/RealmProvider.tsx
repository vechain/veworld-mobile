import React from "react"
import { CacheProvider, StoreProvider } from "~Storage"

type Props = {
    children: React.ReactNode
}

export const RealmProvider = ({ children }: Props) => {
    // const [key, setKey] = useState<ArrayBuffer | null>(null)

    // const init = useCallback(async () => {
    // const res = await KeychainService.getEncryptionKey(true)
    // console.log("KEYCHAIN ------>", res)
    // if (res) {
    //     const key64 = Buffer.from(res!, "base64")
    //     const keyToArr = new Uint8Array(key64)
    //     let _key = keyToArr
    //     setKey(_key)
    // }
    // else {
    //     const arr = new Uint8Array(64)
    //     const keyBuff = crypto.getRandomValues(arr) as ArrayBuffer
    //     setKey(keyBuff)
    //     const key64: string = Buffer.from(keyBuff).toString("base64")
    //     await KeychainService.setEncryptionKey(key64, isBiometryEnabled)
    // }
    // }, [])

    return (
        <CacheProvider>
            <StoreProvider>{children}</StoreProvider>
        </CacheProvider>
    )
}
