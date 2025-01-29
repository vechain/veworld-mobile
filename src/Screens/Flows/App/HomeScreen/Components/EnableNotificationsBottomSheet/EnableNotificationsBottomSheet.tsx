import { useFocusEffect } from "@react-navigation/native"
import moment from "moment"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, useNotifications } from "~Components"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import {
    selectLastNotificationReminder,
    updateLastNotificationReminder,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const EnableNotificationsBottomSheet = () => {
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyle)
    const { ref, onOpen, onClose } = useBottomSheetModal()
    const { isNotificationPermissionEnabled, isUserOptedIn, optIn, requestNotficationPermission } = useNotifications()

    const lastNotificationReminderTimestamp = useAppSelector(selectLastNotificationReminder)

    const updateLastNotificationReminderTimestamp = useCallback(() => {
        const now = moment()
        dispatch(updateLastNotificationReminder(now.unix()))
    }, [dispatch])

    const onGotToSettingsPress = useCallback(() => {
        if (isUserOptedIn && !isNotificationPermissionEnabled) {
            requestNotficationPermission()
        } else if (!isUserOptedIn) {
            optIn()
        }

        onClose()
    }, [isNotificationPermissionEnabled, isUserOptedIn, onClose, optIn, requestNotficationPermission])

    const onDismissPress = useCallback(() => {
        onClose()
    }, [onClose])

    useFocusEffect(
        useCallback(() => {
            let hasOneMonthPassedSinceLastReminder = true

            if (lastNotificationReminderTimestamp) {
                const _lastNotificationReminderTimestamp = moment.unix(lastNotificationReminderTimestamp)
                const now = moment()
                hasOneMonthPassedSinceLastReminder = now.diff(_lastNotificationReminderTimestamp, "months") >= 1
            }

            const areNotificationsDisabled =
                isUserOptedIn !== null &&
                isNotificationPermissionEnabled !== null &&
                (isUserOptedIn === false || isNotificationPermissionEnabled === false)

            const shouldShowModal = hasOneMonthPassedSinceLastReminder && areNotificationsDisabled

            if (shouldShowModal) {
                updateLastNotificationReminderTimestamp()
                onOpen()
            }
        }, [
            isNotificationPermissionEnabled,
            isUserOptedIn,
            lastNotificationReminderTimestamp,
            onOpen,
            updateLastNotificationReminderTimestamp,
        ]),
    )

    return (
        <BaseBottomSheet bottomSafeArea dynamicHeight ref={ref}>
            <BaseView style={styles.contentContainer}>
                <BaseIcon color={theme.colors.text} name={"icon-bell-ring"} size={40} />
                <BaseSpacer height={24} />
                <BaseText typographyFont="button">{LL.ACTIVATE_NOTIFICATION_MODAL_TITLE()}</BaseText>
                <BaseSpacer height={8} />
                <BaseText style={styles.description} typographyFont="body">
                    {LL.ACTIVATE_NOTIFICATION_MODAL_SUBTITLE()}
                </BaseText>
                <BaseSpacer height={24} />
                <BaseButton
                    w={100}
                    haptics="Light"
                    title={LL.ACTIVATE_NOTIFICATION_MODAL_ENABLE_BTN()}
                    action={onGotToSettingsPress}
                />
                <BaseSpacer height={8} />
                <BaseButton
                    w={100}
                    haptics="Light"
                    variant="outline"
                    title={LL.ACTIVATE_NOTIFICATION_MODAL_SKIP_BTN()}
                    action={onDismissPress}
                />
            </BaseView>
        </BaseBottomSheet>
    )
}

export const baseStyle = () =>
    StyleSheet.create({
        contentContainer: {
            alignItems: "center",
        },
        description: {
            textAlign: "center",
        },
    })
