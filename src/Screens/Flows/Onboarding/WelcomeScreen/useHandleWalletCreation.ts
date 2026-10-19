import { useCallback, useState } from "react"
import {
    runOnboardingStorageMigration,
    runOnboardingOperationOnce,
    showErrorToast,
    showInfoToast,
    StorageEncryptionKeyHelper,
    useApplicationSecurity,
    useStore,
    WalletEncryptionKeyHelper,
} from "~Components"
import { StorageEncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import { useBiometrics, useCreateWallet, useDisclosure } from "~Hooks"
import { resetApp, setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { mnemonic as thorMnemonic } from "thor-devkit"
import { DEVICE_TYPE, IMPORT_TYPE, NewLedgerDevice, SecurityLevelType, WALLET_STATUS } from "~Model"
import { BiometricsUtils, error } from "~Utils"
import HapticsService from "~Services/HapticsService"
import { useI18nContext } from "~i18n"
import { isEmpty } from "lodash"
import { DerivationPath, ERROR_EVENTS } from "~Constants"
import { SocialProvider } from "@vechain/embedded-wallet-sdk"

const LOCAL_WALLET_TYPES: DEVICE_TYPE[] = [DEVICE_TYPE.LOCAL_MNEMONIC, DEVICE_TYPE.LOCAL_PRIVATE_KEY]

export const useHandleWalletCreation = () => {
    const biometrics = useBiometrics()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { createLocalWallet, createLedgerWallet, createSmartWallet } = useCreateWallet()
    const { migrateOnboarding, walletStatus } = useApplicationSecurity()
    const { persistor, store } = useStore()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const [isError, setIsError] = useState("")

    const countLocalWallets = useCallback(() => {
        const devices = store?.getState().devices ?? []
        return devices.filter(device => LOCAL_WALLET_TYPES.includes(device.type)).length
    }, [store])

    const onWalletCreationError = useCallback(
        (_error: unknown) => {
            dispatch(setIsAppLoading(false))

            if (BiometricsUtils.BiometricErrors.isBiometricCanceled(_error)) {
                showInfoToast({ text1: LL.NOTIFICATION_AUTHENTICATION_CANCELLED() })
                return
            }

            if (BiometricsUtils.BiometricErrors.isBiometricTooManyAttempts(_error)) {
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_TOO_MANY_BIOMETRICS_AUTH_ATTEMPTS())
                showErrorToast({
                    text1: LL.ERROR_TOO_MANY_BIOMETRICS_AUTH_ATTEMPTS(),
                })
            } else {
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_CREATING_WALLET())
                showErrorToast({ text1: LL.ERROR_CREATING_WALLET() })
            }
        },
        [LL, dispatch],
    )

    const rollbackOnboardingAttempt = useCallback(async () => {
        await WalletEncryptionKeyHelper.remove().catch(() => undefined)
        await StorageEncryptionKeyHelper.remove().catch(() => undefined)
        dispatch(resetApp())
    }, [dispatch])

    const mintOnboardingKeys = useCallback(
        async (pinCode?: string): Promise<StorageEncryptionKeys> => {
            if (countLocalWallets() > 0) {
                throw new Error("Refusing to mint a wallet key beside an existing local wallet")
            }

            await WalletEncryptionKeyHelper.init(pinCode)
            return StorageEncryptionKeyHelper.init(pinCode)
        },
        [countLocalWallets],
    )

    const runOnboardingCreation = useCallback(
        (operation: () => Promise<void>) => {
            return runOnboardingOperationOnce(async () => {
                if (walletStatus !== WALLET_STATUS.FIRST_TIME_ACCESS) {
                    error(ERROR_EVENTS.SECURITY, "onboarding_creation_refused", walletStatus)
                    showErrorToast({ text1: LL.ERROR_CREATING_WALLET() })
                    return
                }

                dispatch(setIsAppLoading(true))
                try {
                    if (countLocalWallets() > 0) await rollbackOnboardingAttempt()

                    await operation()
                } catch (e) {
                    onWalletCreationError(e)
                    await rollbackOnboardingAttempt()
                } finally {
                    dispatch(setIsAppLoading(false))
                }
            })
        },
        [LL, countLocalWallets, dispatch, onWalletCreationError, rollbackOnboardingAttempt, walletStatus],
    )

    const completeOnboardingMigration = useCallback(
        async (type: SecurityLevelType, storageKeys: StorageEncryptionKeys) => {
            if (!persistor) throw new Error("Redux persistor is not ready")

            await runOnboardingStorageMigration(persistor, () => migrateOnboarding(type, storageKeys))
        },
        [migrateOnboarding, persistor],
    )

    const onCreateWallet = useCallback(
        async ({
            importMnemonic,
            privateKey,
            derivationPath,
            importType,
        }: {
            derivationPath: DerivationPath
            importMnemonic?: string[]
            privateKey?: string
            importType?: IMPORT_TYPE
        }) => {
            if (biometrics && biometrics.currentSecurityLevel === "BIOMETRIC") {
                return runOnboardingCreation(async () => {
                    const mnemonic = isEmpty(importMnemonic) ? getNewMnemonic() : importMnemonic
                    const storageKeys = await mintOnboardingKeys()
                    await createLocalWallet({
                        mnemonic: privateKey ? undefined : mnemonic,
                        privateKey,
                        importType,
                        derivationPath,
                    })

                    await completeOnboardingMigration(SecurityLevelType.BIOMETRIC, storageKeys)
                })
            } else {
                onOpen()
            }
        },
        [biometrics, completeOnboardingMigration, createLocalWallet, mintOnboardingKeys, onOpen, runOnboardingCreation],
    )

    const onCreateSmartWallet = useCallback(
        async ({
            address,
            name,
            linkedProviders,
        }: {
            address: string
            name?: string
            linkedProviders?: SocialProvider[]
        }) => {
            if (biometrics && biometrics.currentSecurityLevel === "BIOMETRIC") {
                return runOnboardingCreation(async () => {
                    const storageKeys = await mintOnboardingKeys()
                    await createSmartWallet({ address, name, linkedProviders })
                    await completeOnboardingMigration(SecurityLevelType.BIOMETRIC, storageKeys)
                })
            } else {
                onOpen()
            }
        },
        [biometrics, completeOnboardingMigration, createSmartWallet, mintOnboardingKeys, onOpen, runOnboardingCreation],
    )

    const onSuccess = useCallback(
        async ({
            pin,
            mnemonic,
            privateKey,
            derivationPath,
            importType,
        }: {
            pin: string
            mnemonic?: string[]
            privateKey?: string
            derivationPath: DerivationPath
            importType?: IMPORT_TYPE
        }) => {
            onClose()
            return runOnboardingCreation(async () => {
                const _mnemonic = isEmpty(mnemonic) ? getNewMnemonic() : mnemonic
                const storageKeys = await mintOnboardingKeys(pin)
                await createLocalWallet({
                    mnemonic: privateKey ? undefined : _mnemonic,
                    privateKey: privateKey,
                    userPassword: pin,
                    importType,
                    derivationPath,
                })

                await completeOnboardingMigration(SecurityLevelType.SECRET, storageKeys)
            })
        },
        [completeOnboardingMigration, createLocalWallet, mintOnboardingKeys, onClose, runOnboardingCreation],
    )

    const onSmartWalletPinSuccess = useCallback(
        async ({
            pin,
            address,
            name,
            linkedProviders,
        }: {
            pin: string
            address: string
            name?: string
            linkedProviders?: SocialProvider[]
        }) => {
            onClose()
            return runOnboardingCreation(async () => {
                const storageKeys = await mintOnboardingKeys(pin)
                await createSmartWallet({ address, name, linkedProviders })
                await completeOnboardingMigration(SecurityLevelType.SECRET, storageKeys)
            })
        },
        [completeOnboardingMigration, createSmartWallet, mintOnboardingKeys, onClose, runOnboardingCreation],
    )

    const onCreateLedgerWallet = useCallback(
        async ({
            newLedger,
            disconnectLedger,
        }: {
            newLedger: NewLedgerDevice
            disconnectLedger: () => Promise<void>
        }) => {
            if (biometrics && biometrics.currentSecurityLevel === "BIOMETRIC") {
                return runOnboardingCreation(async () => {
                    const storageKeys = await mintOnboardingKeys()
                    await createLedgerWallet({ newLedger })
                    await disconnectLedger()
                    await completeOnboardingMigration(SecurityLevelType.BIOMETRIC, storageKeys)
                })
            } else {
                onOpen()
            }
        },
        [
            biometrics,
            completeOnboardingMigration,
            createLedgerWallet,
            mintOnboardingKeys,
            onOpen,
            runOnboardingCreation,
        ],
    )

    const onLedgerPinSuccess = useCallback(
        async ({
            newLedger,
            disconnectLedger,
            pin,
        }: {
            newLedger: NewLedgerDevice | null
            disconnectLedger: () => Promise<void>
            pin: string
        }) => {
            if (!newLedger || !pin) throw new Error("Wrong/corrupted data. No device available from ledger or no pin")
            return runOnboardingCreation(async () => {
                const storageKeys = await mintOnboardingKeys(pin)
                await createLedgerWallet({ newLedger })
                await disconnectLedger()
                await completeOnboardingMigration(SecurityLevelType.SECRET, storageKeys)
            })
        },
        [completeOnboardingMigration, createLedgerWallet, mintOnboardingKeys, runOnboardingCreation],
    )

    const createOnboardedWallet = useCallback(
        async ({ pin, derivationPath }: { pin?: string; derivationPath: DerivationPath.VET }) => {
            dispatch(setIsAppLoading(true))

            const mnemonic = getNewMnemonic()
            await createLocalWallet({
                mnemonic: mnemonic,
                userPassword: pin,
                onError: onWalletCreationError,
                derivationPath,
            })
            dispatch(setIsAppLoading(false))
        },
        [createLocalWallet, dispatch, onWalletCreationError],
    )

    const importOnboardedWallet = useCallback(
        async ({
            importMnemonic,
            privateKey,
            pin,
            derivationPath,
            importType,
        }: {
            importMnemonic?: string[]
            privateKey?: string
            pin?: string
            derivationPath: DerivationPath
            importType: IMPORT_TYPE
        }) => {
            if (biometrics && biometrics.currentSecurityLevel === "BIOMETRIC" && !pin) {
                dispatch(setIsAppLoading(true))
                await createLocalWallet({
                    mnemonic: privateKey ? undefined : importMnemonic,
                    privateKey,
                    importType,
                    onError: onWalletCreationError,
                    derivationPath,
                })
                dispatch(setIsAppLoading(false))
            } else {
                await createLocalWallet({
                    mnemonic: privateKey ? undefined : importMnemonic,
                    privateKey,
                    userPassword: pin,
                    importType,
                    onError: onWalletCreationError,
                    derivationPath,
                })
            }
        },
        [biometrics, createLocalWallet, dispatch, onWalletCreationError],
    )

    const importOnboardedSmartWallet = useCallback(
        async ({
            address,
            name,
            linkedProviders,
        }: {
            address: string
            name?: string
            linkedProviders?: SocialProvider[]
        }) => {
            dispatch(setIsAppLoading(true))
            await createSmartWallet({
                address,
                name,
                linkedProviders,
                onError: onWalletCreationError,
            })
            dispatch(setIsAppLoading(false))
        },
        [createSmartWallet, dispatch, onWalletCreationError],
    )
    const importLedgerWallet = useCallback(
        async ({
            newLedger,
            disconnectLedger,
        }: {
            newLedger: NewLedgerDevice
            disconnectLedger: () => Promise<void>
        }) => {
            dispatch(setIsAppLoading(true))
            await createLedgerWallet({
                newLedger,
                onError: onWalletCreationError,
            })
            await disconnectLedger()
            dispatch(setIsAppLoading(false))
        },
        [createLedgerWallet, dispatch, onWalletCreationError],
    )

    return {
        onCreateWallet,
        isOpen,
        isError,
        onSuccess,
        onSmartWalletPinSuccess,
        onClose,
        onCreateLedgerWallet,
        onCreateSmartWallet,
        onLedgerPinSuccess,
        createOnboardedWallet,
        importOnboardedWallet,
        importOnboardedSmartWallet,
        importLedgerWallet,
    }
}

function getNewMnemonic() {
    const seed = thorMnemonic.generate()
    if (seed.length === 12 && seed.every(word => word.length > 0)) {
        return seed
    } else {
        return getNewMnemonic()
    }
}
