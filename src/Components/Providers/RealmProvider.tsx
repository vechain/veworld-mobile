import React from "react"
// import crypto from "react-native-quick-crypto"
// import KeychainService from "~Services/KeychainService"
// import { selectIsBiometrics, useAppSelector } from "~Storage/Caches"
import { RealmProvider as RealmStore } from "~Storage/Realm"
// var Buffer = require("@craftzdog/react-native-buffer").Buffer

type Props = {
    children: React.ReactNode
}

export const RealmProvider = ({ children }: Props) => {
    // const isBiometryEnabled = useAppSelector(selectIsBiometrics)

    // if biometrics is enabled, get encryption key from keychain
    // TODO: get encryption key from keychain

    // if biometrics is disabled, get encryption key from redux
    // TODO: get encryption key from redux

    // const getKey = useCallback(async () => {
    //     const keyChainKey = await KeychainService.getOrGenerateEncryptionKey(
    //         isBiometryEnabled,
    //     )

    //     if (false) {
    //         const key64 = Buffer.from(keyChainKey, "base64")
    //         const keyToArr = new Uint8Array(key64)
    //         let _key = keyToArr
    //         setKey(_key)
    //     } else {
    //         const arr = new Uint8Array(64)
    //         const keyBuff = crypto.getRandomValues(arr) as ArrayBuffer
    //         // const key64: string = Buffer.from(keyBuff).toString("base64")

    //         // console.log("keyBuff", keyBuff)
    //         // console.log("key64", key64)

    //         // SecureStore.setItemAsync(KeychainKeys.realmKey, key64)
    //         setKey(keyBuff)
    //     }
    // }, [isBiometryEnabled])

    // const generateKey = () => {
    //     const arr = new Uint8Array(64)
    //     const keyBuff = crypto.getRandomValues(arr) as ArrayBuffer
    //     // const key64: string = Buffer.from(keyBuff).toString("base64")
    //     // console.log("key64", key64)
    //     console.log("keyBuff", keyBuff)
    //     return keyBuff
    // }
    // const [key, setKey] = useState<ArrayBuffer>(generateKey())
    // console.log(key)

    // useEffect(() => {
    // const init = async () => {
    // getKey()
    // if (isAuth.success) {
    //     getKey()
    // } else {
    //     setKey()
    // }
    // }
    // init()
    // }, [getKey])

    return <RealmStore>{children}</RealmStore>
}
