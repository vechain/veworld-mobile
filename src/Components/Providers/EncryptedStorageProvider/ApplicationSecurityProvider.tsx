import React, { useCallback, useEffect, useMemo, useState } from "react"
import { MMKV } from "react-native-mmkv"
import { BiometricsUtils, CryptoUtils_Legacy, debug, error, HexUtils, info } from "~Utils"
import { BiometricState, SecurityLevelType, Wallet, WALLET_STATUS } from "~Model"
import {
    PreviousInstallation,
    SecurityConfig,
    SecurityUpgradeBackup,
    StorageEncryptionKeyHelper,
    WalletEncryptionKeyHelper,
} from "~Components/Providers"

import { useAppState, useBiometrics } from "~Hooks"
import { StandaloneAppBlockedScreen, StandaloneLockScreen, InternetDownScreen } from "~Screens"
import { AnimatedSplashScreen } from "../../../AnimatedSplashScreen"
import Onboarding from "./Helpers/Onboarding"
import NetInfo from "@react-native-community/netinfo"
import { ERROR_EVENTS } from "~Constants"

const UserEncryptedStorage = new MMKV({
    id: "user_encrypted_storage",
})

// const UserEncryptedStorage_V2 = new MMKV({
//     id: "user_encrypted_storage_V2",
// })

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
    migrateOnboarding: (type: SecurityLevelType, pinCode?: string) => Promise<void>
    resetApplication: () => Promise<void>
    walletStatus: WALLET_STATUS
    updateSecurityMethod: (currentPinCode: string, newPinCode?: string) => Promise<boolean>
    securityType: SecurityLevelType
    setWalletStatus: (status: WALLET_STATUS) => void
    isAppReady: boolean
    setIsAppReady: (isReady: boolean) => void
    lockApplication: () => void
    triggerAutoLock: () => void
    needsSecurityUpgradeToV2: () => boolean
    upgradeSecurityToV2: (password?: string) => void
}

const ApplicationSecurityContext = React.createContext<IApplicationSecurity | undefined>(undefined)

type ApplicationSecurityContextProviderProps = { children: React.ReactNode }
export const ApplicationSecurityProvider = ({ children }: ApplicationSecurityContextProviderProps) => {
    const [autoLock, setAutoLock] = useState(false)
    const [walletStatus, setWalletStatus] = useState<WALLET_STATUS>(WALLET_STATUS.NOT_INITIALISED)
    const { currentState } = useAppState()
    const [securityType, setSecurityType] = useState<SecurityLevelType>(SecurityLevelType.NONE)
    const [reduxStorage, setReduxStorage] = useState<EncryptedStorage>()
    const [imageStorage, setImageStorage] = useState<EncryptedStorage>()
    const [metadataStorage, setMetadataStorage] = useState<EncryptedStorage>()
    const [userDisabledBiometrics, setUserDisabledBiometrics] = useState(false)

    // After unlocking, we need to wait for the redux to be setup before we can render the app
    const [isAppReady, setIsAppReady] = useState(false)

    const biometrics = useBiometrics()

    const onboardingKey = useMemo(() => HexUtils.generateRandom(256), [])

    const triggerAutoLock = () => {
        setAutoLock(true)
    }

    const updateSecurityType = useCallback((type: SecurityLevelType | undefined) => {
        if (!type) {
            SecurityConfig.remove()
        } else {
            SecurityConfig.set(type)
        }
        setSecurityType(type ?? SecurityLevelType.NONE)
    }, [])

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
    const unlock = useCallback(async (pinCode?: string): Promise<void> => {
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
            keys = backUpKeys?.storage ?? (await StorageEncryptionKeyHelper.get(pinCode))
        } catch (e) {
            // handle cases when  the user cancels the biometric prompt and the keychain returns it as an error
            if (BiometricsUtils.BiometricErrors.isBiometricCanceled(e)) {
                return unlock()
            } else {
                throw e
            }
        }

        if (keys) {
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
        }
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

                const biometricsDisabled = !isDeviceEnrolled || currentSecurityLevel !== SecurityLevelType.BIOMETRIC

                if (biometricsDisabled) {
                    setUserDisabledBiometrics(true)
                    // The user has disabled biometrics, so render that screen
                    return
                }

                await unlock()
            } catch (e) {
                error(ERROR_EVENTS.SECURITY, "Failed to get encryption keys", e)
            }
        },
        [unlock],
    )

    const needsSecurityUpgradeToV2 = useCallback(() => {
        const encryptedStorageKeys = UserEncryptedStorage.getAllKeys()
        if (encryptedStorageKeys.length > 0) {
            debug(ERROR_EVENTS.SECURITY, "Needs security upgrade to V2")
            return true
        }

        return false
    }, [])

    const upgradeSecurityToV2 = useCallback(async (password?: string) => {
        const encryptedStorageKeys = UserEncryptedStorage.getAllKeys()
        /*
            encryptedStorageKeys contains ["persist:root", "persist:nft"]
        */

        if (encryptedStorageKeys.length > 0) {
            // Get the wallet key
            // TODO: Do we need to have a separate key for each wallet?
            const { walletKey } = await WalletEncryptionKeyHelper.get(password)

            // Get the storage keys
            const storageEncryptionKeys = await StorageEncryptionKeyHelper.get(password)
            const reduxKey = storageEncryptionKeys.redux
            // Get the encrypted state
            const persistedState = UserEncryptedStorage.getString("persist:root")
            if (!persistedState) return // TODO: handle this case somehow
            const state = JSON.parse(persistedState)

            // let newState = {}
            let newWallets: string[] = []

            // Go over the state enreies and decrypt them
            for (const key of Object.keys(state)) {
                const encrypted = state[key] as string
                const toDecrypt = encrypted.replace(/['"]+/g, "").replace("0x", "")
                const unencrypted = CryptoUtils_Legacy.decryptState(toDecrypt, reduxKey)
                const parsedEntry = JSON.parse(unencrypted)

                // Get wallets from unencrypted entries and decrypt them
                if (Array.isArray(parsedEntry)) {
                    if ("wallet" in parsedEntry[0] && "xPub" in parsedEntry[0]) {
                        // loop on parsedEntry and decrypt each wallet
                        for (const wallet of parsedEntry) {
                            //  encrypt the wallets with the new encryption algorithm
                            const decryptedWallet: Wallet = await WalletEncryptionKeyHelper.decryptWallet(
                                wallet.wallet,
                                walletKey,
                            )

                            const walletEncrypted_V2 = await WalletEncryptionKeyHelper.encryptWallet(
                                decryptedWallet,
                                password,
                            )

                            newWallets.push(walletEncrypted_V2)

                            /*
                                2. recreate the state by encrypting the rest of the parsedEntries
                                3. need to do the same for the other storage entries (see encryptedStorageKeys)
                                4. store the state in the new storage - UserEncryptedStorage_V2
                                5. clear out the old storage - UserEncryptedStorage
                               
                            */
                        }
                    }
                }
            }

            // console.log("newWallets", newWallets)
        }
    }, [])

    /**
     * Checks if the user has onboarded and sets up the encryption keys if so
     */
    const intialiseApp = useCallback(
        async (_biometrics: BiometricState) => {
            const encryptedStorageKeys = UserEncryptedStorage.getAllKeys()

            if (encryptedStorageKeys.length === 0) {
                info(ERROR_EVENTS.SECURITY, "No keys found in encrypted storage, user is onboarding")

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
                setWalletStatus(WALLET_STATUS.LOCKED)
                await setUpEncryptionKeys(_biometrics)
            }
        },
        [setUpEncryptionKeys, onboardingKey],
    )

    const migrateOnboarding = useCallback(
        async (type: SecurityLevelType, pinCode?: string): Promise<void> => {
            updateSecurityType(type)

            const encryptionKeys = await StorageEncryptionKeyHelper.init(pinCode)

            try {
                Onboarding.migrateState({
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
                error(ERROR_EVENTS.SECURITY, e)
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
            const type = newPinCode ? SecurityLevelType.SECRET : SecurityLevelType.BIOMETRIC

            const success = await SecurityUpgradeBackup.updateSecurityMethod(currentPinCode, newPinCode)

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
        if (biometrics && currentState === "active" && walletStatus === WALLET_STATUS.NOT_INITIALISED) {
            intialiseApp(biometrics)
                .then(() => {
                    debug(ERROR_EVENTS.SECURITY, "App state initialised app")
                })
                .catch(e => {
                    error(ERROR_EVENTS.SECURITY, e)
                })
        }
    }, [walletStatus, currentState, biometrics, intialiseApp])

    // Handle auto lock request
    useEffect(() => {
        if (autoLock) {
            try {
                if (walletStatus === WALLET_STATUS.UNLOCKED && currentState !== "active") {
                    lockApplication()
                }
            } catch (e) {
                error(ERROR_EVENTS.SECURITY, e)
            } finally {
                setAutoLock(false)
            }
        }
    }, [autoLock, setAutoLock, walletStatus, currentState, lockApplication])

    const value: IApplicationSecurity | undefined = useMemo(() => {
        if (!reduxStorage || walletStatus === WALLET_STATUS.NOT_INITIALISED) return

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
            triggerAutoLock,
            upgradeSecurityToV2,
            needsSecurityUpgradeToV2,
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
        upgradeSecurityToV2,
        needsSecurityUpgradeToV2,
    ])

    const { isConnected } = NetInfo.useNetInfo()

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
                    {!isConnected ? <InternetDownScreen /> : children}
                </ApplicationSecurityContext.Provider>
            )
        case WALLET_STATUS.LOCKED:
            if (userDisabledBiometrics) return <StandaloneAppBlockedScreen />

            if (securityType !== SecurityLevelType.SECRET) return <></>
            return (
                <AnimatedSplashScreen playAnimation useFadeOutAnimation={false}>
                    <StandaloneLockScreen onPinInserted={unlock} />
                </AnimatedSplashScreen>
            )
    }
}

export const useApplicationSecurity = () => {
    const context = React.useContext(ApplicationSecurityContext)

    if (!context) {
        throw new Error("useApplicationSecurity must be used within a ApplicationSecurityContext")
    }

    return context
}

export const useWalletStatus = (): WALLET_STATUS => {
    const { walletStatus } = useApplicationSecurity()

    return walletStatus
}
