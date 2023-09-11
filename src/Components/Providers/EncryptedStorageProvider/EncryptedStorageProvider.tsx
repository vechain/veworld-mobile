import React, { useCallback, useEffect, useMemo, useState } from "react"
import { MMKV } from "react-native-mmkv"
import { CryptoUtils, debug, error, HexUtils, warn } from "~Utils"
import { BiometricState, SecurityLevelType, WALLET_STATUS } from "~Model"
import { EncryptionKeyHelper, SecurityConfig } from "~Components/Providers"
import { EncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import Onboarding from "~Components/Providers/EncryptedStorageProvider/Helpers/Onboarding"
import { useBiometrics } from "~Hooks"

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
    resetApplication: () => Promise<void>
    walletStatus: WALLET_STATUS
}

const EncryptedStorageContext = React.createContext<
    IEncryptedStorage | undefined
>(undefined)

type EncryptedStorageContextProviderProps = { children: React.ReactNode }
export const EncryptedStorageProvider = ({
    children,
}: EncryptedStorageContextProviderProps) => {
    const [walletStatus, setWalletStatus] = useState<WALLET_STATUS>(
        WALLET_STATUS.NOT_INITIALISED,
    )
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
    const [userDisabledBiometrics, setUserDisabledBiometrics] = useState(false)

    const biometrics = useBiometrics()

    const onboardingKey = useMemo(() => HexUtils.generateRandom(256), [])

    /**
     * Reset the application state
     */
    const resetApplication = useCallback(async () => {
        setWalletStatus(WALLET_STATUS.FIRST_TIME_ACCESS)
        setImageStorage(undefined)
        setMetadataStorage(undefined)
        setSecurityType(undefined)

        UserEncryptedStorage.clearAll()
        OnboardingStorage.clearAll()

        setReduxStorage({
            mmkv: OnboardingStorage,
            encryptionKey: onboardingKey,
        })

        await EncryptionKeyHelper.deleteKeys()
        SecurityConfig.remove()
    }, [onboardingKey])

    /**
     * Unlock the app with a pin code
     */
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

    /**
     * Unlock the app with biometrics
     */
    const unlockWithBiometrics = useCallback(async () => {
        const { data } = await EncryptionKeyHelper.getEncryptionKeys()

        const keys = JSON.parse(data) as EncryptionKeys

        setReduxStorage({
            mmkv: UserEncryptedStorage,
            encryptionKey: keys.redux,
        })

        setImageStorage(ImageStorage(keys.images))
        setMetadataStorage(MetadataStorage(keys.metadata))
    }, [])

    /**
     * Set the type of security
     * - Attempt to unlock with biometrics if the user has biometrics enabled
     */
    const setUpEncryptionKeys = useCallback(
        async (_biometrics: BiometricState) => {
            try {
                const _securityType = SecurityConfig.get()

                setSecurityType(_securityType)

                if (_securityType === SecurityLevelType.SECRET) {
                    // We need the pin code to decrypt the encryption keys, so return and render the screen
                    return
                }

                const { isDeviceEnrolled, currentSecurityLevel } = _biometrics

                const biometricsDisabled =
                    !isDeviceEnrolled ||
                    currentSecurityLevel !== SecurityLevelType.BIOMETRIC

                if (biometricsDisabled) {
                    setUserDisabledBiometrics(true)
                    // The user has disabled biometrics, so render that screen
                    return
                }

                await unlockWithBiometrics()
            } catch (e) {
                error("Failed to get encryption keys", e)
            }
        },
        [unlockWithBiometrics],
    )

    /**
     * Checks if the user has onboarded and sets up the encryption keys if so
     */
    const intialiseApp = useCallback(
        async (_biometrics: BiometricState) => {
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
                setWalletStatus(WALLET_STATUS.FIRST_TIME_ACCESS)
            } else {
                warn("Keys found in encrypted storage")
                setWalletStatus(WALLET_STATUS.LOCKED)
                await setUpEncryptionKeys(_biometrics)
            }
        },
        [setUpEncryptionKeys, onboardingKey],
    )

    const migrateOnboarding = useCallback(
        async (type: SecurityLevelType, pinCode?: string): Promise<void> => {
            SecurityConfig.set(type)

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
                setWalletStatus(WALLET_STATUS.UNLOCKED)
            } catch (e) {
                error(e)
                SecurityConfig.remove()
                await resetApplication()
            }
        },
        [resetApplication, onboardingKey],
    )

    useEffect(() => {
        debug({
            walletStatus,
            securityType,
        })
    }, [walletStatus, securityType])

    /**
     * Initialise the app
     */
    useEffect(() => {
        if (biometrics) {
            intialiseApp(biometrics)
                .then(() => {
                    debug("App state initialised app")
                })
                .catch(e => {
                    error("App state failed to initialise app", e)
                })
        }
    }, [biometrics, intialiseApp])

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
        if (!reduxStorage || walletStatus === WALLET_STATUS.NOT_INITIALISED)
            return

        return {
            redux: reduxStorage,
            migrateOnboarding,
            images: imageStorage,
            metadata: metadataStorage,
            resetApplication,
            walletStatus,
        }
    }, [
        imageStorage,
        metadataStorage,
        reduxStorage,
        migrateOnboarding,
        walletStatus,
        resetApplication,
    ])

    if (
        walletStatus === WALLET_STATUS.LOCKED &&
        !reduxStorage?.encryptionKey &&
        securityType === SecurityLevelType.SECRET
    ) {
        warn("Waiting for redux encryption key")
        // TODO: Add a standalone pin code screen
        // <LockScreen />
        return <></>
    }

    if (userDisabledBiometrics) {
        // TODO: Add a standalone screen to tell the user they disabled biometrics
        // <SecurityDowngradeScreen />
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

export const useWalletStatus = () => {
    const { walletStatus } = useEncryptedStorage()

    return walletStatus
}
