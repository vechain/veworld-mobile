import React, { useCallback, useEffect, useMemo } from "react"
import { MMKV } from "react-native-mmkv"
import ReduxKeyService from "~Services/HapticsService/ReduxKeyService"
import { debug } from "~Utils"

const UserEncryptedStorage = new MMKV({
    id: "user_encrypted_storage",
})

const OnboardingStorage = new MMKV({
    id: "onboarding_storage",
})

type IEncryptedStorage =
    | undefined
    | {
          storage: MMKV
          isOnboarding: boolean
          encryptWithUserKey: (key: string) => Promise<void>
      }

type WalletStatus = "onboarding" | "onboarded" | "unknown"

const EncryptedStorageContext =
    React.createContext<IEncryptedStorage>(undefined)

type EncryptedStorageContextProviderProps = { children: React.ReactNode }

export const EncryptedStorageProvider = ({
    children,
}: EncryptedStorageContextProviderProps) => {
    const [walletStatus, setWalletStatus] =
        React.useState<WalletStatus>("unknown")

    // This function could be called from StoreContextProvider to use in the transformer method
    const getReduxKey = useCallback(async () => {
        let encryptionKey: string | null

        try {
            // This will fail if we used biometrics to previously store the key
            encryptionKey = await ReduxKeyService.getPinCodeKey()
        } catch (e) {
            encryptionKey = await ReduxKeyService.getBiometricKey()
        }

        // TODO: We should be able to use the encryptionKey to decrypt the storage
        debug("encryptionKey", encryptionKey)
    }, [])

    const checkIsOnboarding = useCallback(() => {
        const encryptedStorageKeys = UserEncryptedStorage.getAllKeys()

        if (encryptedStorageKeys.length === 0) {
            debug("No keys found in encrypted storage")

            setWalletStatus("onboarding")
        } else {
            debug("Keys found in encrypted storage")
            setWalletStatus("onboarded")
        }
    }, [])

    const encryptWithUserKey = useCallback(
        async (key: string): Promise<void> => {
            // TODO: Here we have to take the onboarding state, encrypt it with the user's key, and store it in the encrypted storage
        },
        [],
    )

    useEffect(() => {
        checkIsOnboarding()
    }, [checkIsOnboarding])

    const storage = useMemo(() => {
        if (walletStatus === "onboarding") {
            return OnboardingStorage
        } else if (walletStatus === "onboarded") {
            return UserEncryptedStorage
        }
    }, [walletStatus])

    const value: IEncryptedStorage | undefined = useMemo(() => {
        if (!storage) return

        return {
            storage,
            isOnboarding: walletStatus === "onboarding",
            encryptWithUserKey,
        }
    }, [storage, walletStatus])

    if (!value) return <></>

    if (walletStatus === "onboarded") {
        // TODO: Render a standalone lockscreen that will try to unecrypt the storage
    }

    return (
        <EncryptedStorageContext.Provider value={value}>
            {children}
        </EncryptedStorageContext.Provider>
    )
}

export const useEncryptedStorage = () => {
    const context = React.useContext(EncryptedStorageContext)

    if (!context) {
        throw new Error(
            "useEncryptedStorage must be used within a EncryptedStorageContext",
        )
    }

    return context
}
