import React, { useEffect } from "react"
import { StyleSheet } from "react-native"
import { SecurityAlertLight } from "~Assets"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import JailMonkey from "jail-monkey"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Routes, TabStackParamList } from "~Navigation"
import {
    selectShowJailbrokeDeviceWarning,
    setShowJailbrokeDeviceWarning,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const DeviceJailBrokenWarningModal = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation<NativeStackNavigationProp<TabStackParamList>>()
    const showJailbrokeWarning = useAppSelector(selectShowJailbrokeDeviceWarning)
    const dispatch = useAppDispatch()

    const { ref, onOpen, onClose } = useBottomSheetModal()

    useEffect(() => {
        if (showJailbrokeWarning && JailMonkey.isJailBroken()) onOpen()
    }, [onOpen, showJailbrokeWarning])

    const goToPrivacyScreen = () => {
        onClose()
        dispatch(setShowJailbrokeDeviceWarning(false))
        nav.navigate("SettingsStack", { screen: Routes.SETTINGS, initial: true })
        nav.navigate("SettingsStack", { screen: Routes.SETTINGS_PRIVACY, initial: false })
    }

    const onDismissModal = () => {
        onClose()
        dispatch(setShowJailbrokeDeviceWarning(false))
    }

    return (
        <BaseBottomSheet bottomSafeArea dynamicHeight blurBackdrop ref={ref}>
            <BaseView style={styles.contentContainer}>
                <SecurityAlertLight />
                <BaseSpacer height={24} />
                <BaseText typographyFont="button">{LL.DEVICE_JAILBROKE_MODAL_TITLE()}</BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body" align="center">
                    {LL.DEVICE_JAILBROKE_MODAL_SUBTITLE()}
                </BaseText>
                <BaseSpacer height={24} />
                <BaseButton
                    testID="Backup_now_button"
                    accessible
                    variant="solid"
                    size="lg"
                    haptics="Medium"
                    w={100}
                    title={LL.BTN_BACKUP_ALERT_CONFIRM()}
                    action={goToPrivacyScreen}
                    activeOpacity={0.94}
                />
                <BaseSpacer height={16} />
                <BaseButton
                    testID="Backup_later_button"
                    accessible
                    variant="outline"
                    size="lg"
                    haptics="Medium"
                    w={100}
                    title={LL.BTN_BACKUP_ALERT_CLOSE()}
                    action={onDismissModal}
                    activeOpacity={0.94}
                />
            </BaseView>
            <BaseSpacer height={16} />
        </BaseBottomSheet>
    )
}

const baseStyles = () => {
    return StyleSheet.create({
        contentContainer: {
            alignItems: "center",
        },
    })
}
