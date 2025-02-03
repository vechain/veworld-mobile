import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useState } from "react"
import { useSharedValue, withTiming } from "react-native-reanimated"
import {
    BaseSpacer,
    BaseTouchable,
    BaseView,
    EnableFeature,
    Layout,
    RequireUserPassword,
    showWarningToast,
} from "~Components"
import { ERROR_EVENTS } from "~Constants"
import { useBottomSheetModal, useCheckWalletBackup, useDisclosure, useInterval, useWalletSecurity } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE, LocalDevice } from "~Model"
import { Routes } from "~Navigation"
import {
    selectAnalyticsTrackingEnabled,
    selectAreDevFeaturesEnabled,
    selectDevicesState,
    selectLocalDevices,
    selectSelectedAccount,
    setAnalyticsTrackingEnabled,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { warn } from "~Utils"
import { BackupWarningBottomSheet, DevicesBackupState, EnableBiometrics } from "./Components"
import { useBackupCredential, useEditPin } from "./Hooks"

export const PrivacyScreen = () => {
    // [START] - Hooks setup
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const dispatch = useAppDispatch()

    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const isAnalyticsTrackingEnabled = useAppSelector(selectAnalyticsTrackingEnabled)
    const devices = useAppSelector(selectDevicesState)
    const localDevices = useAppSelector(selectLocalDevices) as LocalDevice[]

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isShowBackupModal = useCheckWalletBackup(selectedAccount)

    const { isWalletSecurityBiometrics } = useWalletSecurity()

    const { openWithDelay: openWalletMgmtSheetWithDelay, onClose: closeWalletMgmtSheet } = useBottomSheetModal()

    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()

    const openBackupPhraseSheetWithDelay = useCallback(
        (delay: number, credential: string[] | string, deviceToBackup: LocalDevice) => {
            if (!credential.length) return

            setTimeout(() => {
                nav.navigate(Routes.ICLOUD_CREDENTIAL_BACKUP, {
                    credential,
                    deviceToBackup,
                })
            }, delay)
        },
        [nav],
    )

    const { onPasswordSuccess, handleOnSelectedWallet } = useBackupCredential({
        closePasswordPrompt,
        openBackupPhraseSheetWithDelay,
        openWalletMgmtSheetWithDelay,
        openPasswordPrompt,
        closeWalletMgmtSheet,
        devices: localDevices,
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

    const handleDeviceBackup = useCallback(
        (device: LocalDevice) => {
            handleOnSelectedWallet(device)
        },
        [handleOnSelectedWallet],
    )

    // [END] - Hooks setup

    // [START] - Internal Methods
    const toggleAppLockSwitch = useCallback((newValue: boolean) => {
        warn(ERROR_EVENTS.SETTINGS, newValue)
    }, [])

    const toggleAnalyticsTrackingSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setAnalyticsTrackingEnabled(newValue))
        },
        [dispatch],
    )

    // [END] - Internal Methods

    // [START] - Animations
    const animationProgress = useSharedValue(0)
    const [count, setCount] = useState<number>(0)
    useInterval({
        callback: () => {
            setCount(prev => prev + 1)
        },
        delay: 800,
        enabled: isShowBackupModal,
    })

    useEffect(() => {
        animationProgress.value = withTiming(1, { duration: 400 }, () => {
            animationProgress.value = withTiming(0, { duration: 400 })
        })
    }, [animationProgress, count])

    // [END] - Animations

    return (
        <Layout
            safeAreaTestID="PrivacyScreen"
            title={LL.TITLE_PRIVACY()}
            body={
                <>
                    <BaseView>
                        {/*TODO: https://github.com/vechainfoundation/veworld-mobile/issues/1339*/}
                        {__DEV__ && (
                            <>
                                <EnableFeature
                                    title={LL.SB_PASSWORD_AUTH()}
                                    subtitle={LL.BD_APP_LOCK()}
                                    onValueChange={toggleAppLockSwitch}
                                    value={false}
                                />

                                <BaseSpacer height={40} />
                            </>
                        )}

                        <EnableBiometrics />

                        {!isWalletSecurityBiometrics && (
                            <>
                                <BaseSpacer height={8} />
                                <BaseView alignItems="flex-end" w={100}>
                                    <BaseView alignItems="center" w={50}>
                                        <BaseTouchable
                                            haptics="Light"
                                            action={handleOnEditPinPress}
                                            title={LL.BTN_EDIT_PIN()}
                                            underlined
                                        />
                                    </BaseView>
                                </BaseView>
                            </>
                        )}

                        <BaseSpacer height={40} />

                        <DevicesBackupState devices={devices} onPress={handleDeviceBackup} />

                        <RequireUserPassword
                            isOpen={isPasswordPromptOpen}
                            onClose={closePasswordPrompt}
                            onSuccess={onPasswordSuccess}
                        />

                        <BaseSpacer height={40} />

                        {devFeaturesEnabled && (
                            <>
                                <EnableFeature
                                    title={LL.SB_ANALYTICS_TRACKING()}
                                    subtitle={LL.BD_ANALYTICS_TRACKING()}
                                    onValueChange={toggleAnalyticsTrackingSwitch}
                                    value={isAnalyticsTrackingEnabled}
                                />
                            </>
                        )}

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
