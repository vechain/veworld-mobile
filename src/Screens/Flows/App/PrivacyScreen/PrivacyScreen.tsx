import React, { useCallback } from "react"
import { useBottomSheetModal, useDisclosure, useWalletSecurity } from "~Hooks"
import {
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseView,
    EnableFeature,
    Layout,
    RequireUserPassword,
    SelectDeviceBottomSheet,
    showWarningToast,
} from "~Components"
import { useBackupMnemonic } from "./Hooks/useBackupMnemonic"
import { useI18nContext } from "~i18n"
import { BackupMnemonicBottomSheet, EnableBiometrics } from "./Components"
import { DEVICE_TYPE, LocalDevice, WALLET_STATUS } from "~Model"
import {
    selectAreDevFeaturesEnabled,
    selectSelectedAccount,
    setIsPinCodeRequired,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    selectAnalyticsTrackingEnabled,
    selectLocalDevices,
} from "~Storage/Redux/Selectors"

import {
    setAnalyticsTrackingEnabled,
    setAppLockStatus,
} from "~Storage/Redux/Actions"
import { useEditPin } from "./Hooks/useEditPin"
import { BackupWarningBottomSheet } from "./Components/BackupWarningBottomSheet"
import { isSmallScreen } from "~Constants"
import { usePinCode } from "~Components/Providers/PinCodeProvider/PinCodeProvider"

export const PrivacyScreen = () => {
    // [START] - Hooks setup
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const { isPinRequired, removePinCode, enablePinCodeStorage } = usePinCode()
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const isAnalyticsTrackingEnabled = useAppSelector(
        selectAnalyticsTrackingEnabled,
    )
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { isWalletSecurityBiometrics, isWalletSecurityPassword } =
        useWalletSecurity()

    const {
        ref: BackupPhraseSheetRef,
        openWithDelay: openBackupPhraseSheetWithDelay,
        onClose: closeBackupPhraseSheet,
    } = useBottomSheetModal()

    const {
        ref: walletMgmtBottomSheetRef,
        openWithDelay: openWalletMgmtSheetWithDelay,
        onClose: closeWalletMgmtSheet,
    } = useBottomSheetModal()

    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    const {
        isOpen: isNoPinRequiredPromptOpen,
        onOpen: openNoPinRequiredPrompt,
        onClose: closeNoPinRequiredPrompt,
    } = useDisclosure()

    const {
        onPasswordSuccess,
        checkSecurityBeforeOpening,
        handleOnSelectedWallet,
        mnemonicArray,
    } = useBackupMnemonic({
        closePasswordPrompt,
        openBackupPhraseSheetWithDelay,
        openWalletMgmtSheetWithDelay,
        openPasswordPrompt,
        closeWalletMgmtSheet,
        devices,
        isWalletSecurityBiometrics,
    })

    const {
        onEditPinPress,
        isEditPinPromptOpen,
        closeEditPinPrompt,
        onPinSuccess,
        lockScreenScenario,
        isValidatePassword,
    } = useEditPin()

    const {
        ref: backupWarningSheetRef,
        onOpen: openBackupWarningSheet,
        onClose: closeBackupWarningSheet,
    } = useBottomSheetModal()

    const handleOnEditPinPress = useCallback(() => {
        if (selectedAccount.device.type === DEVICE_TYPE.LEDGER) {
            return showWarningToast(
                LL.HEADS_UP(),
                LL.ALERT_CANT_BACKUP_LEDGER(),
            )
        }
        openBackupWarningSheet()
    }, [selectedAccount, LL, openBackupWarningSheet])

    // [END] - Hooks setup

    // [START] - Internal Methods
    const toggleAppLockSwitch = useCallback(
        (newValue: boolean) => {
            if (newValue) {
                removePinCode()
                dispatch(setIsPinCodeRequired(newValue))
                dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))
            } else {
                openNoPinRequiredPrompt()
            }
        },
        [removePinCode, openNoPinRequiredPrompt, dispatch],
    )

    const onNoPinRequiredSuccess = useCallback(
        (pin: string) => {
            enablePinCodeStorage(pin)
            closeNoPinRequiredPrompt()
        },
        [closeNoPinRequiredPrompt, enablePinCodeStorage],
    )

    const toggleAnalyticsTrackingSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setAnalyticsTrackingEnabled(newValue))
        },
        [dispatch],
    )

    // [END] - Internal Methods

    return (
        <Layout
            safeAreaTestID="PrivacyScreen"
            isScrollEnabled={isSmallScreen}
            body={
                <>
                    <BaseView pt={16}>
                        <BaseText typographyFont="title">
                            {LL.TITLE_PRIVACY()}
                        </BaseText>
                        <BaseSpacer height={24} />

                        {isWalletSecurityPassword && (
                            <>
                                <EnableFeature
                                    title={LL.SB_PASSWORD_AUTH()}
                                    subtitle={LL.BD_APP_LOCK()}
                                    onValueChange={toggleAppLockSwitch}
                                    value={isPinRequired}
                                />

                                <BaseSpacer height={24} />
                            </>
                        )}

                        <EnableBiometrics />

                        {!isWalletSecurityBiometrics && (
                            <>
                                <BaseSpacer height={16} />
                                <BaseTouchable
                                    haptics="Light"
                                    action={handleOnEditPinPress}
                                    title={LL.BTN_EDIT_PIN()}
                                    underlined
                                />
                            </>
                        )}

                        <BaseSpacer height={24} />

                        <BaseText typographyFont="bodyMedium">
                            {LL.SB_BACKUP_MNEMONIC()}
                        </BaseText>
                        <BaseText typographyFont="caption">
                            {LL.BD_BACKUP_MNEMONIC()}
                        </BaseText>

                        <BaseSpacer height={16} />

                        <BaseTouchable
                            haptics="Light"
                            action={checkSecurityBeforeOpening}
                            title={LL.BTN_BACKUP_MENMONIC()}
                            underlined
                        />

                        <BaseSpacer height={24} />

                        {devFeaturesEnabled && (
                            <>
                                <EnableFeature
                                    title={LL.SB_ANALYTICS_TRACKING()}
                                    subtitle={LL.BD_ANALYTICS_TRACKING()}
                                    onValueChange={
                                        toggleAnalyticsTrackingSwitch
                                    }
                                    value={isAnalyticsTrackingEnabled}
                                />
                            </>
                        )}

                        <BackupMnemonicBottomSheet
                            ref={BackupPhraseSheetRef}
                            onClose={closeBackupPhraseSheet}
                            mnemonicArray={mnemonicArray}
                        />

                        <SelectDeviceBottomSheet<LocalDevice>
                            ref={walletMgmtBottomSheetRef}
                            onClose={handleOnSelectedWallet}
                            devices={devices}
                        />

                        <RequireUserPassword
                            isOpen={isPasswordPromptOpen}
                            onClose={closePasswordPrompt}
                            onSuccess={onPasswordSuccess}
                        />

                        <RequireUserPassword
                            onSuccess={onNoPinRequiredSuccess}
                            isOpen={isNoPinRequiredPromptOpen}
                            onClose={closeNoPinRequiredPrompt}
                        />

                        <RequireUserPassword
                            isOpen={isEditPinPromptOpen}
                            onClose={closeEditPinPrompt}
                            onSuccess={onPinSuccess}
                            scenario={lockScreenScenario}
                            isValidatePassword={isValidatePassword}
                        />
                    </BaseView>
                    <BackupWarningBottomSheet
                        ref={backupWarningSheetRef}
                        onConfirm={onEditPinPress}
                        onClose={closeBackupWarningSheet}
                    />
                </>
            }
        />
    )
}
