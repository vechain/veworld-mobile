import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import moment from "moment"
import React, { useEffect } from "react"
import { StyleSheet } from "react-native"
import { SecurityAlertLight } from "~Assets"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useBottomSheetModal, useCheckWalletBackup, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes, TabStackParamList } from "~Navigation"
import {
    selectLastBackupRequestTimestamp,
    selectSelectedAccount,
    setLastBackupRequestTimestamp,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const DeviceBackupBottomSheet = () => {
    const dispatch = useAppDispatch()
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const navigation = useNavigation<NativeStackNavigationProp<TabStackParamList>>()

    const lastBackupRequestTimestamp = useAppSelector(selectLastBackupRequestTimestamp)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { ref, onOpen, onClose } = useBottomSheetModal()

    const isBackupNeeded = useCheckWalletBackup(selectedAccount)

    useEffect(() => {
        const address = selectedAccount.device?.rootAddress ?? ""

        if (!isBackupNeeded) {
            dispatch(
                setLastBackupRequestTimestamp({
                    address,
                    timestamp: undefined,
                }),
            )
            return
        }

        const now = moment()

        if (isBackupNeeded && !lastBackupRequestTimestamp) {
            dispatch(
                setLastBackupRequestTimestamp({
                    address: address,
                    timestamp: now.unix(),
                }),
            )
            onOpen()
            return
        }

        if (lastBackupRequestTimestamp) {
            const timeStamp = lastBackupRequestTimestamp[address]

            if (isBackupNeeded && !timeStamp) {
                dispatch(
                    setLastBackupRequestTimestamp({
                        address: address,
                        timestamp: now.unix(),
                    }),
                )
                onOpen()
                return
            }

            if (timeStamp) {
                const _lastBackupRequestTimestamp = moment.unix(timeStamp)
                const shouldOpen = now.diff(_lastBackupRequestTimestamp, "weeks") >= 1 && isBackupNeeded

                if (shouldOpen) {
                    dispatch(
                        setLastBackupRequestTimestamp({
                            address: address,
                            timestamp: now.unix(),
                        }),
                    )

                    onOpen()
                }
            }
        }
    }, [dispatch, isBackupNeeded, lastBackupRequestTimestamp, onClose, onOpen, selectedAccount.device?.rootAddress])

    const goToPrivacyScreen = () => {
        onClose()
        navigation.navigate("SettingsStack", { screen: Routes.SETTINGS, initial: true })
        navigation.navigate("SettingsStack", { screen: Routes.SETTINGS_PRIVACY, initial: false })
    }

    return (
        <BaseBottomSheet bottomSafeArea dynamicHeight ref={ref}>
            <BaseView style={styles.contentContainer}>
                <SecurityAlertLight />
                <BaseSpacer height={24} />
                <BaseText typographyFont="button">{LL.DEVICE_BACKUP_MODAL_TITLE()}</BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body">{LL.DEVICE_BACKUP_MODAL_SUBTITLE()}</BaseText>
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
                    action={onClose}
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
