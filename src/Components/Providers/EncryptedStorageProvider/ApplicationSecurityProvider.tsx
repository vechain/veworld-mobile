import React, { useCallback, useEffect, useMemo, useState } from "react"
import { MMKV } from "react-native-mmkv"
import { debug, error, HexUtils, warn } from "~Utils"
import { BiometricState, SecurityLevelType, WALLET_STATUS } from "~Model"
import {
    PreviousInstallation,
    SecurityConfig,
    SecurityUpgradeBackup,
    StorageEncryptionKeyHelper,
    WalletEncryptionKeyHelper,
} from "~Components/Providers"
import Onboarding from "~Components/Providers/EncryptedStorageProvider/Helpers/Onboarding"
import { useAppState, useBiometrics } from "~Hooks"
import {
    StandaloneAppBlockedScreen,
    StandaloneLockScreen,
    StandaloneRetryBiometrics,
} from "~Screens/Standalone"
import RNBootSplash from "react-native-bootsplash"
import { AnimatedSplashScreen } from "../../../AnimatedSplashScreen"
import { GlobalEventEmitter, LOCK_APP_EVENT } from "~Events"

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

export type EncryptedStorage = {
    mmkv: MMKV
    encryptionKey: string
}

type IApplicationSecurity = {
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
    ) => Promise<boolean>
    securityType: SecurityLevelType
    setWalletStatus: (status: WALLET_STATUS) => void
    isAppReady: boolean
    setIsAppReady: (isReady: boolean) => void
    lockApplication: () => void
}

const ApplicationSecurityContext = React.createContext<
    IApplicationSecurity | undefined
>(undefined)

type ApplicationSecurityContextProviderProps = { children: React.ReactNode }
export const ApplicationSecurityProvider = ({
    children,
}: ApplicationSecurityContextProviderProps) => {
    const [walletStatus, setWalletStatus] = useState<WALLET_STATUS>(
        WALLET_STATUS.NOT_INITIALISED,
    )
    const { currentState } = useAppState()
    const [securityType, setSecurityType] = useState<SecurityLevelType>(
        SecurityLevelType.NONE,
    )
    const [reduxStorage, setReduxStorage] = useState<EncryptedStorage>()
    const [imageStorage, setImageStorage] = useState<EncryptedStorage>()
    const [metadataStorage, setMetadataStorage] = useState<EncryptedStorage>()
    const [userDisabledBiometrics, setUserDisabledBiometrics] = useState(false)
    const [userCancelledBiometrics, setUserCancelledBiometrics] =
        useState(false)

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

        await WalletEncryptionKeyHelper.remove()
        await StorageEncryptionKeyHelper.remove()
    }, [onboardingKey, updateSecurityType])

    /**
     * Unlock the app
     */
    const unlock = useCallback(async (pinCode?: string) => {
        let backUpKeys = null

        if (pinCode) {
            // Will return null if they don't exist
            backUpKeys = await SecurityUpgradeBackup.get(pinCode)
        }

        if (backUpKeys) {
            // Reset to old keys
            // We verified pin code because the user was able to decrypt the keys in the backup
            await WalletEncryptionKeyHelper.set(backUpKeys.wallet, pinCode)
            await StorageEncryptionKeyHelper.set(backUpKeys.storage, pinCode)
            await SecurityUpgradeBackup.clear()
        }

        let keys

        try {
            keys =
                backUpKeys?.storage ??
                (await StorageEncryptionKeyHelper.get(pinCode))
        } catch (e) {
            if (
                e instanceof Error &&
                e.message.includes("User canceled the operation")
            ) {
                setUserCancelledBiometrics(true)
            }
            throw e
        }

        setUserCancelledBiometrics(false)

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

                await PreviousInstallation.clearOldStorage()

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

            const encryptionKeys = await StorageEncryptionKeyHelper.init(
                pinCode,
            )

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

    /**
     * Update the security method
     * @returns {boolean} - Whether the security method was updated successfully
     */
    const updateSecurityMethod = useCallback(
        async (currentPinCode: string, newPinCode?: string) => {
            const type = newPinCode
                ? SecurityLevelType.SECRET
                : SecurityLevelType.BIOMETRIC

            const success = await SecurityUpgradeBackup.updateSecurityMethod(
                currentPinCode,
                newPinCode,
            )

            if (success) {
                updateSecurityType(type)
            }

            return success
        },
        [updateSecurityType],
    )

    const lockApplication = useCallback(() => {
        if (walletStatus !== WALLET_STATUS.UNLOCKED) return
        setWalletStatus(WALLET_STATUS.NOT_INITIALISED)
        setReduxStorage(undefined)
        setImageStorage(undefined)
        setMetadataStorage(undefined)
    }, [walletStatus])

    /**
     * Initialise the app
     */
    useEffect(() => {
        if (
            biometrics &&
            currentState === "active" &&
            walletStatus === WALLET_STATUS.NOT_INITIALISED
        ) {
            intialiseApp(biometrics)
                .then(() => {
                    debug("App state initialised app")
                })
                .catch(e => {
                    error("App state failed to initialise app", e)
                })
        }
    }, [walletStatus, currentState, biometrics, intialiseApp])

    useEffect(() => {
        GlobalEventEmitter.on(LOCK_APP_EVENT, lockApplication)
        return () => {
            GlobalEventEmitter.removeListener(LOCK_APP_EVENT, lockApplication)
        }
    }, [lockApplication])

    const value: IApplicationSecurity | undefined = useMemo(() => {
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
            lockApplication,
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
        lockApplication,
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
        case WALLET_STATUS.UNLOCKED:
            if (!value?.redux) return <></>

            //App is onboarding and we're using temporary storage
            return (
                <ApplicationSecurityContext.Provider value={value}>
                    {children}
                </ApplicationSecurityContext.Provider>
            )
        case WALLET_STATUS.LOCKED:
            RNBootSplash.hide({ fade: true, duration: 500 })

            if (userDisabledBiometrics) return <StandaloneAppBlockedScreen />

            if (userCancelledBiometrics)
                return (
                    <StandaloneRetryBiometrics
                        retryBiometrics={() => unlock()}
                    />
                )

            if (securityType !== SecurityLevelType.SECRET) return <></>

            return (
                <AnimatedSplashScreen
                    playAnimation={true}
                    useFadeOutAnimation={false}>
                    <StandaloneLockScreen onPinInserted={unlock} />
                </AnimatedSplashScreen>
            )
    }
}

export const useApplicationSecurity = () => {
    const context = React.useContext(ApplicationSecurityContext)

    if (!context) {
        throw new Error(
            "useApplicationSecurity must be used within a ApplicationSecurityContext",
        )
    }

    return context
}

export const useWalletStatus = (): WALLET_STATUS => {
    const { walletStatus } = useApplicationSecurity()

    return walletStatus
}
