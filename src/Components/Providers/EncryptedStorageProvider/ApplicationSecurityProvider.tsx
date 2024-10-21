import React, { useCallback, useEffect, useMemo, useState } from "react"
import { MMKV } from "react-native-mmkv"
import {
    BiometricsUtils,
    CryptoUtils,
    CryptoUtils_Legacy,
    debug,
    error,
    HexUtils,
    info,
    PasswordUtils,
    AnalyticsUtils,
} from "~Utils"
import {
    BiometricState,
    DEVICE_TYPE,
    LedgerDevice,
    LocalDevice,
    SecurityLevelType,
    Wallet,
    WALLET_STATUS,
} from "~Model"
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
import { AnalyticsEvent, ERROR_EVENTS } from "~Constants"
import { initializeMMKVFlipper } from "react-native-mmkv-flipper-plugin"
import RNBootSplash from "react-native-bootsplash"
import { BackupWalletStack } from "~Screens/Flows/App/SecurityUpgrade_V2/Navigation.standalone"
import SaltHelper from "./Helpers/SaltHelper"
import { StorageEncryptionKeys } from "./Model"
import { mixpanel } from "~Utils/AnalyticsUtils"

const UserEncryptedStorage = new MMKV({
    id: "user_encrypted_storage",
})

const UserEncryptedStorage_V2 = new MMKV({
    id: "user_encrypted_storage_V2",
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

// add this line inside your App.tsx
if (__DEV__) {
    initializeMMKVFlipper({ default: UserEncryptedStorage_V2 })
}

export enum SecurityMigration {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED,
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
    const [_securityMigrationStatus, setSecurityMigrationStatus] = useState(SecurityMigration.NOT_STARTED)

    const [storageKeys, setStorageKeys] = useState<StorageEncryptionKeys | null>(null)

    // After unlocking, we need to wait for the redux to be setup before we can render the app
    const [isAppReady, setIsAppReady] = useState(false)

    const biometrics = useBiometrics()

    const onboardingKey = useMemo(() => HexUtils.generateRandom(256), [])

    const oldPersistedState = useMemo(() => UserEncryptedStorage.getString("persist:root"), [])

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
        UserEncryptedStorage_V2.clearAll()
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
    const unlock = useCallback(
        async (pinCode?: string): Promise<void> => {
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
                keys = storageKeys
                    ? storageKeys
                    : backUpKeys?.storage ?? (await StorageEncryptionKeyHelper.get({ pinCode }))

                setStorageKeys(null)
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
                    mmkv: UserEncryptedStorage_V2,
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
        },
        [storageKeys],
    )

    /**
     * Set the type of security
     * - Attempt to unlock with biometrics if the user has biometrics enabled
     */
    const setUpEncryptionKeys = useCallback(
        async (_biometrics: BiometricState, status?: WALLET_STATUS) => {
            try {
                const _securityType = SecurityConfig.get()

                setSecurityType(_securityType)

                if (_securityType === SecurityLevelType.SECRET) {
                    // We need the pin code to decrypt the encryption keys, so return and render the screen
                    return
                }

                const { isDeviceEnrolled, currentSecurityLevel } = _biometrics

                const biometricsDisabled = !isDeviceEnrolled || currentSecurityLevel !== SecurityLevelType.BIOMETRIC

                if (status === WALLET_STATUS.MIGRATING) {
                    return
                }

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

    /**
     * Checks if the user has onboarded and sets up the encryption keys if so
     */
    const intialiseApp = useCallback(
        async (_biometrics: BiometricState) => {
            const oldStorageKeys = UserEncryptedStorage.getAllKeys()

            if (oldStorageKeys.length > 0) {
                info(ERROR_EVENTS.SECURITY, "User has onboarded, migrating to new storage")
                setWalletStatus(WALLET_STATUS.MIGRATING)
                await setUpEncryptionKeys(_biometrics, WALLET_STATUS.MIGRATING)
                RNBootSplash.hide({ fade: true })
                return
            }

            const currentStorageKeys = UserEncryptedStorage_V2.getAllKeys()

            if (currentStorageKeys.length === 0) {
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
                    encryptedStorage: UserEncryptedStorage_V2,
                    encryptionKey: encryptionKeys.redux,
                    onboardingKey,
                })

                Onboarding.prune(OnboardingStorage)

                setReduxStorage({
                    mmkv: UserEncryptedStorage_V2,
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
        [updateSecurityType, onboardingKey, resetApplication],
    )

    const upgradeSecurityToV2 = useCallback(async (password?: string) => {
        const encryptedStorageKeys = UserEncryptedStorage.getAllKeys()
        AnalyticsUtils.initialize()

        mixpanel.track(AnalyticsEvent.SECURITY_UPGRADE, { status: "STARTED" })
        setSecurityMigrationStatus(SecurityMigration.IN_PROGRESS)

        if (encryptedStorageKeys.length > 0) {
            try {
                // Get data related to the decryption/Encryprion of the wallet keys here (instead of doing it inside the loop for every wallet)
                // so we can reduce the amount of prompting since keys are the same for each wallet
                const { walletKey } = await WalletEncryptionKeyHelper.get({ pinCode: password, isLegacy: true })
                const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
                const iv = PasswordUtils.base64ToBuffer(base64IV)

                // Get the storage keys
                const storageEncryptionKeys = await StorageEncryptionKeyHelper.get({
                    pinCode: password,
                    isLegacy: true,
                })

                setStorageKeys(storageEncryptionKeys)

                const reduxKey = storageEncryptionKeys.redux

                // Get the encrypted state for redux
                const persistedState = UserEncryptedStorage.getString("persist:root")

                if (!persistedState) return
                const oldState = JSON.parse(persistedState)

                type Device = LocalDevice | LedgerDevice
                let newState = {}
                let walletState = {
                    devices: [],
                } as { devices: Device[] }

                // Go over the state enreies and decrypt them
                for (const key in oldState) {
                    if (!oldState.hasOwnProperty(key)) return

                    const encrypted = oldState[key] as string
                    const toDecrypt = encrypted.replace(/['"]+/g, "").replace("0x", "")
                    const unencrypted = CryptoUtils_Legacy.decryptState(toDecrypt, reduxKey)

                    const parsedEntryInState = JSON.parse(unencrypted)

                    // Get wallets from unencrypted entries and decrypt them
                    if (key === "devices") {
                        let decryptedWallets: Wallet[] = []
                        let decryptedDevices: LocalDevice[] = []

                        for (const anyDevice of parsedEntryInState) {
                            if (anyDevice.type === DEVICE_TYPE.LEDGER) {
                                walletState.devices.push(anyDevice)
                            } else {
                                // loop on parsedEntryInState for wallets
                                // First decrypt all wallets with old keys and algos
                                const decryptedWallet: Wallet = CryptoUtils_Legacy.decrypt<Wallet>(
                                    anyDevice.wallet,
                                    walletKey,
                                )

                                decryptedWallets.push(decryptedWallet)
                                decryptedDevices.push(anyDevice)
                            }
                        }

                        for (const [index, device] of decryptedDevices.entries()) {
                            const walletEncrypted_V2 = await CryptoUtils.encrypt(
                                decryptedWallets[index],
                                walletKey,
                                salt,
                                iv,
                            )

                            device.wallet = walletEncrypted_V2
                            device.isMigrated = true
                            walletState.devices.push(device)
                        }
                    } else {
                        newState = {
                            ...newState,
                            [key]: encrypted,
                        }
                    }
                }

                await WalletEncryptionKeyHelper.set({ walletKey }, password)
                await StorageEncryptionKeyHelper.set(storageEncryptionKeys, password)

                newState = {
                    ...newState,
                    devices: JSON.stringify(CryptoUtils.encryptState(walletState.devices, reduxKey)),
                }

                // store the state in the new storage - UserEncryptedStorage_V2
                UserEncryptedStorage_V2.set("persist:root", JSON.stringify(newState))
                setWalletStatus(WALLET_STATUS.NOT_INITIALISED)
                UserEncryptedStorage.clearAll()
                Onboarding.prune(UserEncryptedStorage)
                setSecurityMigrationStatus(SecurityMigration.COMPLETED)
                mixpanel.track(AnalyticsEvent.SECURITY_UPGRADE, { status: "COMPLETED" })
            } catch (err) {
                mixpanel.track(AnalyticsEvent.SECURITY_UPGRADE, { status: "FAILED" })
                error(ERROR_EVENTS.ENCRYPTION, err)
            }
        }
    }, [])

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

    const { isConnected } = NetInfo.useNetInfo()

    switch (walletStatus) {
        case WALLET_STATUS.NOT_INITIALISED:
            // App is initialising
            return <></>
        case WALLET_STATUS.MIGRATING:
            return (
                <BackupWalletStack
                    oldPersistedState={oldPersistedState}
                    securityType={securityType}
                    upgradeSecurityToV2={upgradeSecurityToV2}
                />
            )
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
