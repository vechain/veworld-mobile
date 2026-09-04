import { useCallback, useState } from "react"
import {
    runOnboardingStorageMigration,
    runOnboardingOperationOnce,
    showErrorToast,
    useApplicationSecurity,
    useStore,
    WalletEncryptionKeyHelper,
} from "~Components"
import { useBiometrics, useCreateWallet, useDisclosure } from "~Hooks"
import { resetApp, setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { mnemonic as thorMnemonic } from "thor-devkit"
import { IMPORT_TYPE, NewLedgerDevice, SecurityLevelType } from "~Model"
import { BiometricsUtils } from "~Utils"
import HapticsService from "~Services/HapticsService"
import { useI18nContext } from "~i18n"
import { isEmpty } from "lodash"
import { DerivationPath } from "~Constants"
import { SocialProvider } from "@vechain/embedded-wallet-sdk"

export const useHandleWalletCreation = () => {
    const biometrics = useBiometrics()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { createLocalWallet, createLedgerWallet, createSmartWallet } = useCreateWallet()
    const { migrateOnboarding } = useApplicationSecurity()
    const { persistor } = useStore()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const [isError, setIsError] = useState("")

    const onWalletCreationError = useCallback(
        (_error: unknown) => {
            dispatch(setIsAppLoading(false))

            if (BiometricsUtils.BiometricErrors.isBiometricCanceled(_error)) {
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

    const runOnboardingCreation = useCallback(
        (operation: () => Promise<void>) => {
            return runOnboardingOperationOnce(async () => {
                dispatch(setIsAppLoading(true))
                try {
                    await operation()
                } catch (e) {
                    onWalletCreationError(e)
                    await Promise.allSettled([
                        Promise.resolve().then(() => WalletEncryptionKeyHelper.remove()),
                        Promise.resolve().then(() => dispatch(resetApp())),
                    ])
                } finally {
                    dispatch(setIsAppLoading(false))
                }
            })
        },
        [dispatch, onWalletCreationError],
    )

    const completeOnboardingMigration = useCallback(
        async (type: SecurityLevelType, pinCode?: string) => {
            if (!persistor) throw new Error("Redux persistor is not ready")

            await runOnboardingStorageMigration(persistor, () => migrateOnboarding(type, pinCode))
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
                    await WalletEncryptionKeyHelper.init()
                    await createLocalWallet({
                        mnemonic: privateKey ? undefined : mnemonic,
                        privateKey,
                        importType,
                        derivationPath,
                    })

                    await completeOnboardingMigration(SecurityLevelType.BIOMETRIC)
                })
            } else {
                onOpen()
            }
        },
        [biometrics, completeOnboardingMigration, createLocalWallet, onOpen, runOnboardingCreation],
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
                    await WalletEncryptionKeyHelper.init()
                    await createSmartWallet({ address, name, linkedProviders })
                    await completeOnboardingMigration(SecurityLevelType.BIOMETRIC)
                })
            } else {
                onOpen()
            }
        },
        [biometrics, completeOnboardingMigration, createSmartWallet, onOpen, runOnboardingCreation],
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
                await WalletEncryptionKeyHelper.init(pin)
                await createLocalWallet({
                    mnemonic: privateKey ? undefined : _mnemonic,
                    privateKey: privateKey,
                    userPassword: pin,
                    importType,
                    derivationPath,
                })

                await completeOnboardingMigration(SecurityLevelType.SECRET, pin)
            })
        },
        [completeOnboardingMigration, createLocalWallet, onClose, runOnboardingCreation],
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
                await WalletEncryptionKeyHelper.init(pin)
                await createSmartWallet({ address, name, linkedProviders })
                await completeOnboardingMigration(SecurityLevelType.SECRET, pin)
            })
        },
        [completeOnboardingMigration, createSmartWallet, onClose, runOnboardingCreation],
    )

    const migrateFromOnboarding = useCallback(
        (pin?: string) =>
            runOnboardingCreation(async () => {
                if (pin) {
                    await completeOnboardingMigration(SecurityLevelType.SECRET, pin)
                } else {
                    await completeOnboardingMigration(SecurityLevelType.BIOMETRIC)
                }
            }),
        [completeOnboardingMigration, runOnboardingCreation],
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
                    await WalletEncryptionKeyHelper.init()
                    await createLedgerWallet({ newLedger })
                    await disconnectLedger()
                    await completeOnboardingMigration(SecurityLevelType.BIOMETRIC)
                })
            } else {
                onOpen()
            }
        },
        [biometrics, completeOnboardingMigration, createLedgerWallet, onOpen, runOnboardingCreation],
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
                await WalletEncryptionKeyHelper.init(pin)
                await createLedgerWallet({ newLedger })
                await disconnectLedger()
                await completeOnboardingMigration(SecurityLevelType.SECRET, pin)
            })
        },
        [completeOnboardingMigration, createLedgerWallet, runOnboardingCreation],
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
        migrateFromOnboarding,
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
