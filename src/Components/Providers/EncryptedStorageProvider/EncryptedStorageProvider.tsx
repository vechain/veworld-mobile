import React, { useCallback, useEffect, useMemo, useState } from "react"
import { MMKV } from "react-native-mmkv"
import { CryptoUtils, debug, error, HexUtils, warn } from "~Utils"
import { SecurityLevelType } from "~Model"
import { EncryptionKeyHelper } from "~Components/Providers"
import { EncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import Onboarding from "~Components/Providers/EncryptedStorageProvider/Helpers/Onboarding"

const UserEncryptedStorage = new MMKV({
    id: "user_encrypted_storage",
})

const OnboardingStorage = new MMKV({
    id: "onboarding_storage",
})

const ImageStorage = (encryptionKey: string) =>
    new MMKV({
        id: "image_storage",
        encryptionKey,
    })

type WalletStatus = "onboarding" | "onboarded" | "unknown"

const MetadataStorage = (encryptionKey: string) =>
    new MMKV({
        id: "metadata_storage",
        encryptionKey,
    })

type IEncryptedStorage = {
    redux: {
        mmkv: MMKV
        encryptionKey: string
    }
    images?: MMKV
    metadata?: MMKV
    migrateOnboarding: (
        type: SecurityLevelType,
        pinCode?: string,
    ) => Promise<void>
    wipeApplication: () => Promise<void>
    walletStatus: WalletStatus
}

const EncryptedStorageContext = React.createContext<
    IEncryptedStorage | undefined
>(undefined)

type EncryptedStorageContextProviderProps = { children: React.ReactNode }
export const EncryptedStorageProvider = ({
    children,
}: EncryptedStorageContextProviderProps) => {
    const [walletStatus, setWalletStatus] = useState<WalletStatus>("unknown")
    const [reduxStorage, setReduxStorage] = useState<
        IEncryptedStorage["redux"] | undefined
    >(undefined)
    const [imageStorage, setImageStorage] = useState<MMKV | undefined>(
        undefined,
    )
    const [metadataStorage, setMetadataStorage] = useState<MMKV | undefined>(
        undefined,
    )
    const [securityType, setSecurityType] = useState<
        SecurityLevelType | undefined
    >(undefined)

    const onboardingKey = useMemo(() => HexUtils.generateRandom(256), [])

    const checkIsOnboarding = useCallback(() => {
        const encryptedStorageKeys = UserEncryptedStorage.getAllKeys()

        if (encryptedStorageKeys.length === 0) {
            warn("No keys found in encrypted storage, user is onboarding")

            OnboardingStorage.getAllKeys().forEach(key => {
                OnboardingStorage.delete(key)
            })

            setReduxStorage({
                mmkv: OnboardingStorage,
                encryptionKey: onboardingKey,
            })
            setWalletStatus("onboarding")
        } else {
            warn("Keys found in encrypted storage")
            setWalletStatus("onboarded")
        }
    }, [onboardingKey])

    const migrateOnboarding = useCallback(
        async (type: SecurityLevelType, pinCode?: string): Promise<void> => {
            const encryptionKeys: EncryptionKeys = {
                redux: HexUtils.generateRandom(256),
                images: HexUtils.generateRandom(8),
                metadata: HexUtils.generateRandom(8),
            }

            await EncryptionKeyHelper.setKeys(encryptionKeys, type, pinCode)

            try {
                await Onboarding.migrateState({
                    onboardingStorage: OnboardingStorage,
                    encryptedStorage: UserEncryptedStorage,
                    encryptionKey: encryptionKeys.redux,
                    onboardingKey,
                })

                Onboarding.prune(OnboardingStorage)

                setReduxStorage({
                    mmkv: UserEncryptedStorage,
                    encryptionKey: encryptionKeys.redux,
                })
                setImageStorage(ImageStorage(encryptionKeys.images))
                setMetadataStorage(MetadataStorage(encryptionKeys.metadata))
                setSecurityType(type)
                setWalletStatus("onboarded")
            } catch (e) {
                error(e)
            }
        },
        [onboardingKey],
    )

    useEffect(() => {
        debug({
            walletStatus,
            securityType,
        })
    }, [walletStatus, securityType])

    const setWithBiometrics = useCallback((data: string) => {
        const keys = JSON.parse(data) as EncryptionKeys

        setReduxStorage({
            mmkv: UserEncryptedStorage,
            encryptionKey: keys.redux,
        })

        setImageStorage(ImageStorage(keys.images))
        setMetadataStorage(MetadataStorage(keys.metadata))
    }, [])

    const getEncryptionKeys = useCallback(async () => {
        const { type, data } = await EncryptionKeyHelper.getEncryptionKeys()

        setSecurityType(type)

        if (type === SecurityLevelType.BIOMETRIC) {
            setWithBiometrics(data)
        }
    }, [setWithBiometrics])

    const unlockWithPinCode = useCallback(async (pinCode: string) => {
        const { data } = await EncryptionKeyHelper.getEncryptionKeys()

        const keys = CryptoUtils.decrypt(data, pinCode) as EncryptionKeys

        if (!keys || !keys.redux) {
            throw new Error("Invalid pin code")
        }

        setReduxStorage({
            mmkv: UserEncryptedStorage,
            encryptionKey: keys.redux,
        })

        setImageStorage(ImageStorage(keys.images))
        setMetadataStorage(MetadataStorage(keys.metadata))
    }, [])

    const wipeApplication = useCallback(async () => {
        setReduxStorage({
            mmkv: OnboardingStorage,
            encryptionKey: onboardingKey,
        })
        setImageStorage(undefined)
        setMetadataStorage(undefined)
        setSecurityType(undefined)
        setWalletStatus("onboarding")

        await EncryptionKeyHelper.deleteKeys()

        const storeKeys = UserEncryptedStorage.getAllKeys()
        for (const key of storeKeys) {
            UserEncryptedStorage.delete(key)
        }

        const onboardingKeys = OnboardingStorage.getAllKeys()
        for (const key of onboardingKeys) {
            OnboardingStorage.delete(key)
        }
    }, [onboardingKey])

    /**
     * Check if the user is onboarding
     */
    useEffect(() => {
        checkIsOnboarding()
    }, [checkIsOnboarding])

    /**
     * If onboarded, update the security type
     */
    useEffect(() => {
        if (walletStatus === "onboarded" && !reduxStorage?.encryptionKey) {
            getEncryptionKeys()
        }
    }, [reduxStorage?.encryptionKey, walletStatus, getEncryptionKeys])

    /**
     * TODO: Remove this with standalone pin code screen - see TODO below
     */
    useEffect(() => {
        if (
            securityType === SecurityLevelType.SECRET &&
            !reduxStorage?.encryptionKey
        ) {
            //TODO: this is unlocking the app for use
            unlockWithPinCode("111111")
        }
    }, [unlockWithPinCode, securityType, reduxStorage])

    const value: IEncryptedStorage | undefined = useMemo(() => {
        if (!reduxStorage || walletStatus === "unknown") return

        return {
            redux: reduxStorage,
            migrateOnboarding,
            images: imageStorage,
            metadata: metadataStorage,
            wipeApplication,
            walletStatus,
        }
    }, [
        imageStorage,
        metadataStorage,
        reduxStorage,
        migrateOnboarding,
        walletStatus,
        wipeApplication,
    ])

    if (
        walletStatus === "onboarded" &&
        !reduxStorage?.encryptionKey &&
        securityType === SecurityLevelType.SECRET
    ) {
        warn("Waiting for redux encryption key")
        // TODO: Add a standalone pin code screen
        return <></>
    }

    if (!value?.redux.encryptionKey) return <></>

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
