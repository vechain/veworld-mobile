import React, { useCallback, useEffect, useMemo, useState } from "react"
import { MMKV } from "react-native-mmkv"
import { debug, error, HexUtils, warn } from "~Utils"
import { BiometricState, SecurityLevelType, WALLET_STATUS } from "~Model"
import {
    SecurityConfig,
    StorageEncryptionKeyHelper,
} from "~Components/Providers"
import Onboarding from "~Components/Providers/EncryptedStorageProvider/Helpers/Onboarding"
import { useBiometrics } from "~Hooks"
import { StandaloneLockScreen } from "~Screens"
import RNBootSplash from "react-native-bootsplash"
import { AnimatedSplashScreen } from "../../../AnimatedSplashScreen"
import EncryptionKeyHelper from "~Components/Providers/EncryptedStorageProvider/Helpers/EncryptionKeyHelper"

const UserEncryptedStorage = new MMKV({
    id: "user_encrypted_storage",
})

const OnboardingStorage = new MMKV({
    id: "onboarding_storage",
})

const ImageStorage = new MMKV({
    id: "image_storage",
})

const MetadataStorage = new MMKV({
    id: "metadata_storage",
})

type EncryptedStorage = {
    mmkv: MMKV
    encryptionKey: string
}

type IEncryptedStorage = {
    redux?: EncryptedStorage
    images?: EncryptedStorage
    metadata?: EncryptedStorage
    migrateOnboarding: (
        type: SecurityLevelType,
        pinCode?: string,
    ) => Promise<void>
    resetApplication: () => Promise<void>
    walletStatus: WALLET_STATUS
    updateSecurityMethod: (
        currentPinCode: string,
        newPinCode?: string,
    ) => Promise<void>
    securityType: SecurityLevelType
    setWalletStatus: (status: WALLET_STATUS) => void
    isAppReady: boolean
    setIsAppReady: (isReady: boolean) => void
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
    const [securityType, setSecurityType] = useState<SecurityLevelType>(
        SecurityLevelType.NONE,
    )
    const [reduxStorage, setReduxStorage] = useState<EncryptedStorage>()
    const [imageStorage, setImageStorage] = useState<EncryptedStorage>()
    const [metadataStorage, setMetadataStorage] = useState<EncryptedStorage>()
    const [userDisabledBiometrics, setUserDisabledBiometrics] = useState(false)

    // After unlocking, we need to wait for the redux to be setup before we can render the app
    const [isAppReady, setIsAppReady] = useState(false)

    const biometrics = useBiometrics()

    const onboardingKey = useMemo(() => HexUtils.generateRandom(256), [])

    const updateSecurityType = useCallback(
        (type: SecurityLevelType | undefined) => {
            if (!type) {
                SecurityConfig.remove()
            } else {
                SecurityConfig.set(type)
            }
            setSecurityType(type ?? SecurityLevelType.NONE)
        },
        [],
    )

    /**
     * Reset the application state
     */
    const resetApplication = useCallback(async () => {
        setWalletStatus(WALLET_STATUS.FIRST_TIME_ACCESS)
        setImageStorage(undefined)
        setMetadataStorage(undefined)
        updateSecurityType(undefined)

        UserEncryptedStorage.clearAll()
        OnboardingStorage.clearAll()

        setReduxStorage({
            mmkv: OnboardingStorage,
            encryptionKey: onboardingKey,
        })

        await EncryptionKeyHelper.remove()
    }, [onboardingKey, updateSecurityType])

    /**
     * Unlock the app
     */
    const unlock = useCallback(async (pinCode?: string) => {
        const keys = await StorageEncryptionKeyHelper.get(pinCode)

        setReduxStorage({
            mmkv: UserEncryptedStorage,
            encryptionKey: keys.redux,
        })

        setImageStorage({
            mmkv: ImageStorage,
            encryptionKey: keys.images,
        })
        setMetadataStorage({
            mmkv: MetadataStorage,
            encryptionKey: keys.metadata,
        })

        setWalletStatus(WALLET_STATUS.UNLOCKED)
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

                await unlock()
            } catch (e) {
                error("Failed to get encryption keys", e)
            }
        },
        [unlock],
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
            updateSecurityType(type)

            const encryptionKeys = await StorageEncryptionKeyHelper.get(pinCode)

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
                setImageStorage({
                    mmkv: ImageStorage,
                    encryptionKey: encryptionKeys.images,
                })
                setMetadataStorage({
                    mmkv: MetadataStorage,
                    encryptionKey: encryptionKeys.metadata,
                })
                setWalletStatus(WALLET_STATUS.UNLOCKED)
            } catch (e) {
                error(e)
                SecurityConfig.remove()
                await resetApplication()
            }
        },
        [updateSecurityType, resetApplication, onboardingKey],
    )

    const updateSecurityMethod = useCallback(
        async (currentPinCode: string, newPinCode?: string) => {
            const type = newPinCode
                ? SecurityLevelType.SECRET
                : SecurityLevelType.BIOMETRIC

            const keys = await EncryptionKeyHelper.get(currentPinCode)

            try {
                await EncryptionKeyHelper.remove()
                await EncryptionKeyHelper.set(keys, newPinCode)
                updateSecurityType(type)
            } catch (e) {
                await EncryptionKeyHelper.set(keys, currentPinCode)
                throw e
            }
        },
        [updateSecurityType],
    )

    /**
     * Initialise the app
     */
    useEffect(() => {
        if (biometrics && walletStatus === WALLET_STATUS.NOT_INITIALISED) {
            intialiseApp(biometrics)
                .then(() => {
                    debug("App state initialised app")
                })
                .catch(e => {
                    error("App state failed to initialise app", e)
                })
        }
    }, [walletStatus, biometrics, intialiseApp])

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
            setWalletStatus,
            isAppReady,
            setIsAppReady,
            updateSecurityMethod,
            securityType,
        }
    }, [
        reduxStorage,
        walletStatus,
        migrateOnboarding,
        imageStorage,
        metadataStorage,
        resetApplication,
        isAppReady,
        updateSecurityMethod,
        securityType,
    ])

    useEffect(() => {
        debug({
            walletStatus,
            securityType,
        })
    }, [walletStatus, securityType])

    switch (walletStatus) {
        case WALLET_STATUS.NOT_INITIALISED:
            // App is initialising
            return <></>
        case WALLET_STATUS.FIRST_TIME_ACCESS:
            if (!value?.redux) return <></>

            //App is onboarding and we're using temporary storage
            return (
                <EncryptedStorageContext.Provider value={value}>
                    {children}
                </EncryptedStorageContext.Provider>
            )
        case WALLET_STATUS.LOCKED:
            if (securityType !== SecurityLevelType.SECRET) return <></>

            if (userDisabledBiometrics) return <></>

            RNBootSplash.hide({ fade: true, duration: 500 })

            return (
                <AnimatedSplashScreen
                    playAnimation={true}
                    useFadeOutAnimation={false}>
                    <StandaloneLockScreen onPinInserted={unlock} />
                </AnimatedSplashScreen>
            )
        case WALLET_STATUS.UNLOCKED:
            if (!value?.redux) return <></>

            //App is unlocked and the storage is ready
            return (
                <EncryptedStorageContext.Provider value={value}>
                    {children}
                </EncryptedStorageContext.Provider>
            )
    }
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
