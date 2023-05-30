import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { ScrollView, StyleSheet } from "react-native"
import {
    useBottomSheetModal,
    useDisclosure,
    useTheme,
    useWalletSecurity,
} from "~Common"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseView,
    EnableFeature,
    RequireUserPassword,
    SelectDeviceBottomSheet,
} from "~Components"
import { useBackupMnemonic } from "./Hooks/useBackupMnemonic"
import { useI18nContext } from "~i18n"
import { EnableBiometrics, BackupMnemonicBottomSheet } from "./Components"
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
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useEditPin } from "./Hooks/useEditPin"

export const PrivacyScreen = () => {
    // [START] - Hooks setup
    const nav = useNavigation()

    const theme = useTheme()

    const { LL } = useI18nContext()

    const tabBarHeight = useBottomTabBarHeight()

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

    // [END] - Hooks setup

    // [START] - Internal Methods
    const goBack = useCallback(() => nav.goBack(), [nav])

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
        <BaseSafeArea grow={1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[
                    baseStyles.scrollViewContainer,
                    { paddingBottom: tabBarHeight },
                ]}
                style={baseStyles.scrollView}>
                <BaseIcon
                    style={baseStyles.backIcon}
                    size={36}
                    name="chevron-left"
                    color={theme.colors.text}
                    action={goBack}
                />
                <BaseSpacer height={12} />
                <BaseView mx={20}>
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
                                action={onEditPinPress}
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
                        action={checkSecurityBeforeOpening}
                        title={LL.BTN_BACKUP_MENMONIC()}
                        underlined
                    />

                    <BaseSpacer height={24} />

                    <EnableFeature
                        title={LL.SB_ANALYTICS_TRACKING()}
                        subtitle={LL.BD_ANALYTICS_TRACKING()}
                        onValueChange={toggleAnalyticsTrackingSwitch}
                        value={isAnalyticsTrackingEnabled}
                    />

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
                <BaseSpacer height={20} />
            </ScrollView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
    },
    scrollView: {
        width: "100%",
    },
})
