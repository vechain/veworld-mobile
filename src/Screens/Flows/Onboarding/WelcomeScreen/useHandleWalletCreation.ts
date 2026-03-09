import { useCallback, useState } from "react"
import { showErrorToast, useApplicationSecurity, WalletEncryptionKeyHelper } from "~Components"
import { useBiometrics, useCreateWallet, useDisclosure } from "~Hooks"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { mnemonic as thorMnemonic } from "thor-devkit"
import { IMPORT_TYPE, NewLedgerDevice, SecurityLevelType } from "~Model"
import { BiometricsUtils } from "~Utils"
import HapticsService from "~Services/HapticsService"
import { useI18nContext } from "~i18n"
import { isEmpty } from "lodash"
import { DerivationPath } from "~Constants"
import { SocialProvider } from "~VechainWalletKit/types/wallet"

export const useHandleWalletCreation = () => {
    const biometrics = useBiometrics()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { createLocalWallet, createLedgerWallet, createSmartWallet } = useCreateWallet()
    const { migrateOnboarding } = useApplicationSecurity()
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
                dispatch(setIsAppLoading(true))
                const mnemonic = isEmpty(importMnemonic) ? getNewMnemonic() : importMnemonic
                await WalletEncryptionKeyHelper.init()
                await createLocalWallet({
                    mnemonic: privateKey ? undefined : mnemonic,
                    privateKey,
                    importType,
                    onError: onWalletCreationError,
                    derivationPath,
                })

                await migrateOnboarding(SecurityLevelType.BIOMETRIC)
                dispatch(setIsAppLoading(false))
            } else {
                onOpen()
            }
        },
        [biometrics, createLocalWallet, dispatch, migrateOnboarding, onOpen, onWalletCreationError],
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
                dispatch(setIsAppLoading(true))
                await WalletEncryptionKeyHelper.init()
                await createSmartWallet({
                    address,
                    name,
                    linkedProviders,
                    onError: onWalletCreationError,
                })
                await migrateOnboarding(SecurityLevelType.BIOMETRIC)
                dispatch(setIsAppLoading(false))
            } else {
                onOpen()
            }
        },
        [biometrics, createSmartWallet, dispatch, migrateOnboarding, onOpen, onWalletCreationError],
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
            dispatch(setIsAppLoading(true))
            const _mnemonic = isEmpty(mnemonic) ? getNewMnemonic() : mnemonic
            await WalletEncryptionKeyHelper.init(pin)
            await createLocalWallet({
                mnemonic: privateKey ? undefined : _mnemonic,
                privateKey: privateKey,
                userPassword: pin,
                importType,
                onError: onWalletCreationError,
                derivationPath,
            })

            await migrateOnboarding(SecurityLevelType.SECRET, pin)
            dispatch(setIsAppLoading(false))
        },
        [createLocalWallet, dispatch, migrateOnboarding, onClose, onWalletCreationError],
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
            dispatch(setIsAppLoading(true))
            await WalletEncryptionKeyHelper.init(pin)
            await createSmartWallet({
                address,
                name,
                linkedProviders,
                onError: onWalletCreationError,
            })
            await migrateOnboarding(SecurityLevelType.SECRET, pin)
            dispatch(setIsAppLoading(false))
        },
        [createSmartWallet, dispatch, migrateOnboarding, onClose, onWalletCreationError],
    )

    const migrateFromOnboarding = useCallback(
        async (pin?: string) => {
            if (pin) {
                await migrateOnboarding(SecurityLevelType.SECRET, pin)
            } else {
                await migrateOnboarding(SecurityLevelType.BIOMETRIC)
            }
        },
        [migrateOnboarding],
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
                dispatch(setIsAppLoading(true))
                await WalletEncryptionKeyHelper.init()
                await createLedgerWallet({
                    newLedger,
                    onError: onWalletCreationError,
                })
                await disconnectLedger()
                await migrateOnboarding(SecurityLevelType.BIOMETRIC)
                dispatch(setIsAppLoading(false))
            } else {
                onOpen()
            }
        },
        [biometrics, createLedgerWallet, dispatch, migrateOnboarding, onOpen, onWalletCreationError],
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
            dispatch(setIsAppLoading(true))
            await WalletEncryptionKeyHelper.init(pin)
            await createLedgerWallet({
                newLedger,
                onError: onWalletCreationError,
            })
            await disconnectLedger()
            await migrateOnboarding(SecurityLevelType.SECRET, pin)
            dispatch(setIsAppLoading(false))
        },
        [createLedgerWallet, dispatch, migrateOnboarding, onWalletCreationError],
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
        getNewMnemonic()
    }
}
