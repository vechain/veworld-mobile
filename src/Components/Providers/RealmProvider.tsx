import React, { useEffect, useState } from "react"
import {
    // CacheProvider,
    StoreProvider,
    SecureStoreProvider,
} from "~Storage/Realm"
// import { selectIsBiometrics, useAppSelector } from "~Storage/Caches"
// import KeychainService from "~Services/KeychainService"
import crypto from "react-native-quick-crypto"

type Props = {
    children: React.ReactNode
}

export const RealmProvider = ({ children }: Props) => {
    // const isBiometryEnabled = useAppSelector(selectIsBiometrics)
    const [key, setKey] = useState<ArrayBuffer>()

    const init = async () => {
        // const res = await KeychainService.getEncryptionKey(true)
        // if (res) {
        //     const key64 = Buffer.from(res!, "base64")
        //     const keyToArr = new Uint8Array(key64)
        //     let _key = keyToArr
        //     setKey(_key)
        // } else {
        const arr = new Uint8Array(64)
        const keyBuff = crypto.getRandomValues(arr) as ArrayBuffer
        setKey(keyBuff)
        // const key64: string = Buffer.from(keyBuff).toString("base64")
        // await KeychainService.setEncryptionKey(key64, isBiometryEnabled)
        // }
    }

    useEffect(() => {
        init()
    }, [])

    if (key) {
        return (
            // <CacheProvider>
            <StoreProvider>
                <SecureStoreProvider>{children}</SecureStoreProvider>
            </StoreProvider>
            // </CacheProvider>
        )
    }

    return <></>
}
