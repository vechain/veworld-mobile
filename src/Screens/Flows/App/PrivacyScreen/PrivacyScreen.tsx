import React, { useCallback, useEffect, useState } from "react"
import {
    useBottomSheetModal,
    useCheckWalletBackup,
    useDisclosure,
    useInterval,
    useTheme,
    useWalletSecurity,
} from "~Hooks"
import {
    BaseIcon,
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
import { EnableBiometrics } from "./Components"
import { DEVICE_TYPE, LocalDevice } from "~Model"
import { selectAreDevFeaturesEnabled, selectSelectedAccount, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectAnalyticsTrackingEnabled, selectLocalDevices } from "~Storage/Redux/Selectors"
import { setAnalyticsTrackingEnabled } from "~Storage/Redux/Actions"
import { useEditPin } from "./Hooks/useEditPin"
import { BackupWarningBottomSheet } from "./Components/BackupWarningBottomSheet"
import { warn } from "~Utils"
import { ERROR_EVENTS } from "~Constants"
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { StyleSheet, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { DevicesBackupState } from "~Screens/Flows/App/PrivacyScreen/Components/DevicesBackupState"

const AnimatedBaseText = Animated.createAnimatedComponent(Text)

export const PrivacyScreen = () => {
    // [START] - Hooks setup
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const dispatch = useAppDispatch()

    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const isAnalyticsTrackingEnabled = useAppSelector(selectAnalyticsTrackingEnabled)
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isShowBackupModal = useCheckWalletBackup(selectedAccount)

    const { isWalletSecurityBiometrics } = useWalletSecurity()

    const {
        ref: walletMgmtBottomSheetRef,
        openWithDelay: openWalletMgmtSheetWithDelay,
        onClose: closeWalletMgmtSheet,
    } = useBottomSheetModal()

    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()

    const openBackupPhraseSheetWithDelay = useCallback(
        (delay: number, mnemonicArray: string[], deviceToBackup: LocalDevice) => {
            if (!mnemonicArray.length) return

            setTimeout(() => {
                nav.navigate(Routes.ICLOUD_MNEMONIC_BACKUP, { mnemonicArray, deviceToBackup })
            }, delay)
        },
        [nav],
    )

    const { onPasswordSuccess, checkSecurityBeforeOpening, handleOnSelectedWallet } = useBackupMnemonic({
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
    const theme = useTheme()
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

    const animatedStyle = useAnimatedStyle(() => {
        return {
            color: interpolateColor(animationProgress.value, [0, 1], [theme.colors.text, theme.colors.danger]),
            transform: [
                {
                    scale: interpolate(animationProgress.value, [0, 1], [0.99, 1.01]),
                },
            ],
        }
    }, [theme.isDark])

    // [END] - Animations

    return (
        <Layout
            safeAreaTestID="PrivacyScreen"
            body={
                <>
                    <BaseView pt={16}>
                        <BaseText typographyFont="title">{LL.TITLE_PRIVACY()}</BaseText>
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
                        <BaseSpacer height={40} />

                        <DevicesBackupState<LocalDevice> devices={devices} />

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
                                {isShowBackupModal ? (
                                    <BaseTouchable haptics="Light" action={checkSecurityBeforeOpening} underlined>
                                        <BaseView flexDirection="row" alignItems="baseline">
                                            <BaseIcon name="alert" size={24} color={theme.colors.danger} />
                                            <BaseSpacer width={8} />
                                            <AnimatedBaseText style={[styles.animatedFont, animatedStyle]}>
                                                {LL.BD_BACKUP_MNEMONIC()}
                                            </AnimatedBaseText>
                                        </BaseView>
                                    </BaseTouchable>
                                ) : (
                                    <BaseTouchable
                                        haptics="Light"
                                        action={checkSecurityBeforeOpening}
                                        underlined
                                        title={LL.BD_BACKUP_MNEMONIC()}
                                    />
                                )}
                                <BaseSpacer height={24} />
                            </>
                        )}

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

const styles = StyleSheet.create({
    animatedFont: {
        fontWeight: "600",
    },
})
