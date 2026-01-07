import { useFocusEffect } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Linking, StyleSheet } from "react-native"
import {
    BaseButton,
    BaseCard,
    BaseIcon,
    BaseSwitch,
    BaseText,
    BaseView,
    EnableFeature,
    Layout,
    showErrorToast,
    showWarningToast,
    useNotifications,
} from "~Components"
import { COLORS, ColorThemeType, NOTIFICATION_CATEGORIES, vechainNewsAndUpdates } from "~Constants"
import { useThemedStyles, useVeBetterDaoDapps } from "~Hooks"
import { useI18nContext } from "~i18n"
import { NETWORK_TYPE } from "~Model"
import {
    selectDappNotifications,
    selectSelectedNetwork,
    setDappNotifications,
    updateLastNotificationReminder,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { FeedbackSeverity, FeedbackType } from "../../../../Components/Providers/FeedbackProvider/Model"
import { Feedback } from "../../../../Components/Providers/FeedbackProvider/Events"

const SUBSCRIPTION_LIMIT = 10

export const NotificationScreen = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { theme, styles } = useThemedStyles(baseStyle)

    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const dappNotifications = useAppSelector(selectDappNotifications)

    const isMainnet = selectedNetwork.type === NETWORK_TYPE.MAIN
    const { data = [], error } = useVeBetterDaoDapps()
    const {
        isNotificationPermissionEnabled,
        isUserOptedIn,
        optIn,
        optOut,
        requestNotficationPermission,
        featureEnabled,
        getTags,
        addTag,
        removeTag,
        addAllDAppsTags,
        removeAllDAppsTags,
        disabledCategories,
        updateNotifCenterPrefs,
    } = useNotifications()

    const [tags, setTags] = useState<{ [key: string]: string }>({})

    const areNotificationsEnabled = !!isUserOptedIn && !!isNotificationPermissionEnabled
    const hasReachedSubscriptionLimit = Object.keys(tags).length === SUBSCRIPTION_LIMIT

    // Notification preference computed values
    const isNftUpdatesEnabled = !disabledCategories.includes(NOTIFICATION_CATEGORIES.NFT_UPDATES)
    const isRewardsEnabled = !disabledCategories.includes(NOTIFICATION_CATEGORIES.REWARDS)

    const updateTags = useCallback(() => {
        getTags().then(setTags)
    }, [getTags])

    const resetLastNotificationReminderTimestamp = useCallback(() => {
        dispatch(updateLastNotificationReminder(null))
    }, [dispatch])

    const toggleNotificationsSwitch = useCallback(() => {
        if (!featureEnabled) {
            return
        }

        if (isUserOptedIn && !isNotificationPermissionEnabled) {
            requestNotficationPermission()
        } else if (!isUserOptedIn) {
            optIn()
        } else {
            resetLastNotificationReminderTimestamp()
            optOut()
        }
    }, [
        featureEnabled,
        isNotificationPermissionEnabled,
        isUserOptedIn,
        optIn,
        optOut,
        requestNotficationPermission,
        resetLastNotificationReminderTimestamp,
    ])

    const showSubscriptionLimitReachedWarning = useCallback(() => {
        showWarningToast({
            text1: LL.PUSH_NOTIFICATIONS_SUBSCRIPTION_LIMIT_REACHED_TITLE(),
            text2: LL.PUSH_NOTIFICATIONS_SUBSCRIPTION_LIMIT_REACHED_DESC(),
        })
    }, [LL])

    const openDeviceSettings = useCallback(() => {
        Linking.openSettings()
    }, [])

    const toogleSubscriptionSwitch = useCallback(
        (tag: string) => (value: boolean) => {
            if (value) {
                if (hasReachedSubscriptionLimit) {
                    showSubscriptionLimitReachedWarning()
                    return
                }

                addTag(tag, "true")
            } else {
                removeTag(tag)
            }

            updateTags()
        },
        [addTag, hasReachedSubscriptionLimit, removeTag, showSubscriptionLimitReachedWarning, updateTags],
    )

    const toogleDAppSubscriptionSwitch = useCallback(() => {
        const allCurrentlyEnabled = data.every(dapp => !!tags[dapp.id])

        if (allCurrentlyEnabled) {
            removeAllDAppsTags()
            dispatch(setDappNotifications(false))
        } else {
            if (hasReachedSubscriptionLimit) {
                showSubscriptionLimitReachedWarning()
                return
            }
            addAllDAppsTags()
            dispatch(setDappNotifications(true))
        }
        updateTags()
    }, [
        data,
        tags,
        removeAllDAppsTags,
        dispatch,
        hasReachedSubscriptionLimit,
        addAllDAppsTags,
        showSubscriptionLimitReachedWarning,
        updateTags,
    ])

    const toggleNotifCenterPreference = useCallback(
        (category: string) => async (value: boolean) => {
            const success = await updateNotifCenterPrefs(category, value)

            if (!success) {
                Feedback.show({
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                    message: LL.NOTIFICATION_CENTER_UPDATE_PREFERENCE_ERROR(),
                    icon: "icon-alert-triangle",
                    duration: 3000,
                })
            }
        },
        [updateNotifCenterPrefs, LL],
    )

    const ListHeaderComponent = useMemo(() => {
        const itemSwitchColor = theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500
        return (
            <>
                <BaseCard style={styles.cardContent}>
                    <BaseView>
                        <BaseView style={styles.allowNotifications}>
                            <BaseIcon
                                name={areNotificationsEnabled ? "icon-bell-ring" : "icon-bell-off"}
                                size={20}
                                color={theme.colors.text}
                            />
                            <BaseView flex={1}>
                                <BaseText typographyFont="bodySemiBold">{LL.PUSH_NOTIFICATIONS_ACTIVE()}</BaseText>
                            </BaseView>
                            <BaseSwitch
                                onValueChange={toggleNotificationsSwitch}
                                value={areNotificationsEnabled}
                                disabled={isNotificationPermissionEnabled ?? true}
                            />
                        </BaseView>
                    </BaseView>

                    {!isNotificationPermissionEnabled && (
                        <BaseView gap={16}>
                            <BaseView style={styles.notificationsDisabledAlert}>
                                <BaseView flex={1} gap={8}>
                                    <BaseView style={styles.alertTitleRow}>
                                        <BaseIcon
                                            size={16}
                                            color={theme.colors.errorAlert.icon}
                                            name="icon-alert-triangle"
                                        />
                                        <BaseText typographyFont="bodyMedium" color={theme.colors.errorAlert.text}>
                                            {LL.PUSH_NOTIFICATIONS_DEVICE_SETTINGS_TITLE()}
                                        </BaseText>
                                    </BaseView>
                                    <BaseText
                                        pl={24}
                                        typographyFont="captionRegular"
                                        color={theme.colors.errorAlert.subText}>
                                        {LL.PUSH_NOTIFICATIONS_DEVICE_SETTINGS_DESC()}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                            <BaseButton
                                action={openDeviceSettings}
                                title={LL.PUSH_NOTIFICATIONS_GO_TO_DEVICE_SETTINGS()}
                                textColor={COLORS.DARK_PURPLE}
                            />
                        </BaseView>
                    )}

                    {areNotificationsEnabled && (
                        <BaseView style={styles.notificationPrefs}>
                            <BaseView gap={8}>
                                <BaseText typographyFont="bodySemiBold">{LL.PUSH_NOTIFICATIONS_UPDATES()}</BaseText>
                                <EnableFeature
                                    title={LL.VECHAIN_NEWS_AND_UPDATES()}
                                    typographyFont="captionMedium"
                                    onValueChange={toogleSubscriptionSwitch(vechainNewsAndUpdates)}
                                    value={!!tags[vechainNewsAndUpdates]}
                                    color={itemSwitchColor}
                                />
                            </BaseView>

                            <BaseView gap={8}>
                                <BaseText typographyFont="bodySemiBold">{LL.PUSH_NOTIFICATIONS_VEBETTERDAO()}</BaseText>
                                {isMainnet && (
                                    <EnableFeature
                                        title={LL.PUSH_NOTIFICATIONS_DAPPS_DESC()}
                                        typographyFont="captionMedium"
                                        onValueChange={toogleDAppSubscriptionSwitch}
                                        value={dappNotifications}
                                        color={itemSwitchColor}
                                    />
                                )}
                            </BaseView>

                            <BaseView gap={8}>
                                <BaseText typographyFont="bodySemiBold">
                                    {LL.PUSH_NOTIFICATIONS_STARGATE_STAKING()}
                                </BaseText>
                                <EnableFeature
                                    title={LL.PUSH_NOTIFICATIONS_STARGATE_NFT_UPDATES()}
                                    typographyFont="captionMedium"
                                    onValueChange={toggleNotifCenterPreference(NOTIFICATION_CATEGORIES.NFT_UPDATES)}
                                    value={isNftUpdatesEnabled}
                                    color={itemSwitchColor}
                                />
                                <EnableFeature
                                    title={LL.PUSH_NOTIFICATIONS_STARGATE_REWARDS()}
                                    typographyFont="captionMedium"
                                    onValueChange={toggleNotifCenterPreference(NOTIFICATION_CATEGORIES.REWARDS)}
                                    value={isRewardsEnabled}
                                    color={itemSwitchColor}
                                />
                            </BaseView>
                        </BaseView>
                    )}
                </BaseCard>
            </>
        )
    }, [
        LL,
        areNotificationsEnabled,
        isMainnet,
        tags,
        toggleNotificationsSwitch,
        toogleSubscriptionSwitch,
        toogleDAppSubscriptionSwitch,
        dappNotifications,
        toggleNotifCenterPreference,
        isNftUpdatesEnabled,
        isRewardsEnabled,
        styles,
        theme,
        isNotificationPermissionEnabled,
        openDeviceSettings,
    ])
    useEffect(() => {
        if (error) {
            showErrorToast({
                text1: LL.PUSH_NOTIFICATIONS_PREFERENCES_GENERIC_ERROR_TITLE(),
                text2: LL.PUSH_NOTIFICATIONS_PREFERENCES_GENERIC_ERROR_DESC(),
            })
        }
    }, [LL, error])

    useFocusEffect(
        useCallback(() => {
            updateTags()
        }, [updateTags]),
    )

    return (
        <Layout
            safeAreaTestID="Notification_Screen"
            title={LL.PUSH_NOTIFICATIONS()}
            body={
                <BaseView pt={16} bg={theme.colors.background}>
                    {ListHeaderComponent}
                </BaseView>
            }
        />
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        cardContent: {
            flexDirection: "column",
            padding: 24,
            gap: 24,
        },
        allowNotifications: {
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
        },
        notificationsDisabledAlert: {
            backgroundColor: theme.colors.errorAlert.background,
            borderRadius: 8,
            padding: 12,
            borderColor: theme.colors.errorAlert.border,
            borderWidth: 1,
        },
        alertTitleRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            minHeight: 20,
        },
        notificationPrefs: {
            borderTopWidth: 1,
            paddingTop: 24,
            gap: 24,
            borderTopColor: theme.isDark ? COLORS.APP_BACKGROUND_DARK : COLORS.GREY_100,
        },
    })
