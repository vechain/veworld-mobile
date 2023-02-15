import React from "react"
import { CacheProvider, StoreProvider } from "~Storage"

type Props = {
    children: React.ReactNode
}

export const RealmProvider = ({ children }: Props) => {
    // const [buffKey, setBuffKey] = useState<ArrayBuffer | undefined>()
    // const [isKey, setIsKey] = useState(false)

    // const getKey = async (encKey: string) => {
    //     const key64 = Buffer.from(encKey, "base64")
    //     const keyToArr = new Uint8Array(key64)

    //     // set key64 to cache and save once the user has chosen security level (can't use realm)

    //     setBuffKey(keyToArr)
    //     setIsKey(true)
    // }

    // const createKey = () => {
    //     const arr = new Uint8Array(64)
    //     const keyBuff = crypto.getRandomValues(arr) as ArrayBuffer

    //     const key64: string = Buffer.from(keyBuff).toString("base64")
    //     // set key64 to cache and save once the user has chosen security level (can't use realm)

    //     setBuffKey(keyBuff)
    //     setIsKey(true)
    // }

    // const init = useCallback(async () => {
    //     // need to know if a realm key is ever created (smtn liek async storage)
    //     const isFirstTime = true
    //     if (isFirstTime) {
    //         createKey()
    //     } else {
    //         // need to create a hook to get results live
    //         // need to know what the user has selected as sec level
    //         // can't use realm (we're outside of the provider)
    //         let isBio = true
    //         const encKey = await KeychainService.getRealmKey(isBio)
    //         getKey(encKey!)
    //     }
    // }, [])

    // useEffect(() => {
    //     init()
    // }, [init])

    // if (!isKey) {
    //     return <></>
    // }

    return (
        <CacheProvider>
            <StoreProvider>{children}</StoreProvider>
        </CacheProvider>
    )
}
