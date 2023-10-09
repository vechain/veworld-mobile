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
import { DEVICE_TYPE, LocalDevice } from "~Model"
import {
    selectAreDevFeaturesEnabled,
    selectSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    selectAnalyticsTrackingEnabled,
    selectLocalDevices,
} from "~Storage/Redux/Selectors"

import { setAnalyticsTrackingEnabled } from "~Storage/Redux/Actions"
import { useEditPin } from "./Hooks/useEditPin"
import { BackupWarningBottomSheet } from "./Components/BackupWarningBottomSheet"
import { isSmallScreen } from "~Constants"
import { warn } from "~Utils"

export const PrivacyScreen = () => {
    // [START] - Hooks setup
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const isAnalyticsTrackingEnabled = useAppSelector(
        selectAnalyticsTrackingEnabled,
    )
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]

    const selectedAccount = useAppSelector(selectSelectedAccount)

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
        if (selectedAccount.device.type === DEVICE_TYPE.LEDGER) {
            return showWarningToast({
                text1: LL.HEADS_UP(),
                text2: LL.ALERT_CANT_BACKUP_LEDGER(),
            })
        }
        openBackupWarningSheet()
    }, [selectedAccount, LL, openBackupWarningSheet])

    // [END] - Hooks setup

    // [START] - Internal Methods
    const toggleAppLockSwitch = useCallback((newValue: boolean) => {
        warn("toggleAppLockSwitch", newValue)
    }, [])

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

                        {/*TODO: https://github.com/vechainfoundation/veworld-mobile/issues/1339*/}
                        {__DEV__ && (
                            <>
                                <EnableFeature
                                    title={LL.SB_PASSWORD_AUTH()}
                                    subtitle={LL.BD_APP_LOCK()}
                                    onValueChange={toggleAppLockSwitch}
                                    value={false}
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

                        {/** this fix a bug where there are only ledger wallets */}
                        {!!devices.length && (
                            <>
                                <BaseTouchable
                                    haptics="Light"
                                    action={checkSecurityBeforeOpening}
                                    title={LL.BD_BACKUP_MNEMONIC()}
                                    underlined
                                />
                                <BaseSpacer height={24} />
                            </>
                        )}

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
