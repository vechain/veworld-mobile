import React, { useCallback, useEffect, useState } from "react"
import KeychainService from "~Services/KeychainService"
import { CacheProvider, StoreProvider } from "~Storage"
import { BiometricsUtils } from "~Common"
import { SecurityLevelType } from "~Model"
import { useEncryptionKey } from "./useEncryptionKey"
const { getDeviceEnrolledLevel } = BiometricsUtils

type Props = {
    children: React.ReactNode
}

export const RealmProvider = ({ children }: Props) => {
    const [isSecurity, setIsSecurity] = useState(true)
    const { getKey, createKey, isKey, buffKey } = useEncryptionKey()

    const init = useCallback(async () => {
        let level = await getDeviceEnrolledLevel()
        if (level === SecurityLevelType.NONE) {
            setIsSecurity(false)
            return
        }

        const encKey = await KeychainService.getRealmKey()
        if (encKey) {
            getKey(encKey!)
        } else {
            await createKey()
        }
    }, [createKey, getKey])

    useEffect(() => {
        init()
    }, [init])

    if (!isKey && isSecurity) {
        return <></>
    }

    if (isSecurity) {
        return (
            <CacheProvider>
                <StoreProvider encryptionKey={buffKey}>
                    {children}
                </StoreProvider>
            </CacheProvider>
        )
    } else {
        return (
            <CacheProvider>
                <StoreProvider>{children}</StoreProvider>
            </CacheProvider>
        )
    }
}
