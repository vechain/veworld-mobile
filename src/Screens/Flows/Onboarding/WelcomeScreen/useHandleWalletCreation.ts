import { useCallback, useState } from "react"
import { showErrorToast, useApplicationSecurity, WalletEncryptionKeyHelper } from "~Components"
import { useBiometrics, useCreateWallet, useDisclosure } from "~Hooks"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { mnemonic as thorMnemonic } from "thor-devkit"
import { SecurityLevelType } from "~Model"
import { BiometricsUtils } from "~Utils"
import HapticsService from "~Services/HapticsService"
import { useI18nContext } from "~i18n"
import { isEmpty } from "lodash"

export const useHandleWalletCreation = () => {
    const biometrics = useBiometrics()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { createLocalWallet } = useCreateWallet()
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
        async ({ importMnemonic, privateKey }: { importMnemonic?: string[]; privateKey?: string }) => {
            if (biometrics && biometrics.currentSecurityLevel === "BIOMETRIC") {
                if (!importMnemonic && !privateKey)
                    throw new Error("Wrong/corrupted data. No device available in store")
                dispatch(setIsAppLoading(true))
                const mnemonic = isEmpty(importMnemonic) ? getNewMnemonic() : importMnemonic
                await WalletEncryptionKeyHelper.init()
                await createLocalWallet({
                    mnemonic: privateKey ? undefined : mnemonic,
                    privateKey,
                    onError: onWalletCreationError,
                })
                await migrateOnboarding(SecurityLevelType.BIOMETRIC)
                dispatch(setIsAppLoading(false))
            } else {
                onOpen()
            }
        },
        [biometrics, createLocalWallet, dispatch, migrateOnboarding, onOpen, onWalletCreationError],
    )

    const onSuccess = useCallback(
        async ({ pin, mnemonic, privateKey }: { pin: string; mnemonic?: string[]; privateKey?: string }) => {
            onClose()
            if (!mnemonic && !privateKey) throw new Error("Wrong/corrupted data. No device available in store")

            dispatch(setIsAppLoading(true))
            const _mnemonic = isEmpty(mnemonic) ? getNewMnemonic() : mnemonic
            await WalletEncryptionKeyHelper.init(pin)
            await createLocalWallet({
                mnemonic: privateKey ? undefined : _mnemonic,
                privateKey: privateKey,
                userPassword: pin,
                onError: onWalletCreationError,
            })
            await migrateOnboarding(SecurityLevelType.SECRET, pin)
            dispatch(setIsAppLoading(false))
        },
        [createLocalWallet, dispatch, migrateOnboarding, onClose, onWalletCreationError],
    )

    return { onCreateWallet, isOpen, isError, onSuccess, onClose }
}

function getNewMnemonic() {
    const seed = thorMnemonic.generate()
    if (seed.length === 12 && seed.every(word => word.length > 0)) {
        return seed
    } else {
        getNewMnemonic()
    }
}
