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
} from "~Components"
import { useBackupMnemonic } from "./Hooks/useBackupMnemonic"
import { useI18nContext } from "~i18n"
import { BackupMnemonicBottomSheet, EnableBiometrics } from "./Components"
import { LocalDevice, WALLET_STATUS } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectAnalyticsTrackingEnabled,
    selectIsAppLockActive,
    selectLocalDevices,
} from "~Storage/Redux/Selectors"

import {
    setAnalyticsTrackingEnabled,
    setAppLockStatus,
    setIsAppLockActive,
} from "~Storage/Redux/Actions"
import { useEditPin } from "./Hooks/useEditPin"
import { BackupWarningBottomSheet } from "./Components/BackupWarningBottomSheet"
import { isSmallScreen } from "~Constants"
import { DEV_FEATURES } from "../../../../../index"

export const PrivacyScreen = () => {
    // [START] - Hooks setup
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const isAppLockActive = useAppSelector(selectIsAppLockActive)

    const isAnalyticsTrackingEnabled = useAppSelector(
        selectAnalyticsTrackingEnabled,
    )
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]

    const { isWalletSecurityBiometrics } = useWalletSecurity()

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
        openBackupWarningSheet()
    }, [openBackupWarningSheet])

    // [END] - Hooks setup

    // [START] - Internal Methods
    const toggleAppLockSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setIsAppLockActive(newValue))
            dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))
        },
        [dispatch],
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

                        <EnableFeature
                            title={LL.SB_PASSWORD_AUTH()}
                            subtitle={LL.BD_APP_LOCK()}
                            onValueChange={toggleAppLockSwitch}
                            value={isAppLockActive}
                        />

                        <BaseSpacer height={24} />

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

                        {DEV_FEATURES && (
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
