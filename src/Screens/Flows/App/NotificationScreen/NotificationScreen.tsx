import { useFocusEffect } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    BaseCard,
    BaseSpacer,
    BaseText,
    BaseView,
    EnableFeature,
    Layout,
    showErrorToast,
    showWarningToast,
    useNotifications,
} from "~Components"
import { vechainNewsAndUpdates, voteReminderTagKey } from "~Constants"
import { useThemedStyles, useVeBetterDaoDapps } from "~Hooks"
import { useI18nContext } from "~i18n"
import { NETWORK_TYPE } from "~Model"
import { selectSelectedNetwork, updateLastNotificationReminder, useAppDispatch, useAppSelector } from "~Storage/Redux"

const SUBSCRIPTION_LIMIT = 10

export const NotificationScreen = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { theme } = useThemedStyles(baseStyle)

    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const isMainnet = selectedNetwork.type === NETWORK_TYPE.MAIN
    const { data = [], error } = useVeBetterDaoDapps()
    const { getTags, addTag, addDAppTag, removeTag, removeDAppTag } = useNotifications()

    const [dappNotifications, setDappNotifications] = useState<boolean>(false)
    const [tags, setTags] = useState<{ [key: string]: string }>({})

    const {
        isNotificationPermissionEnabled,
        isUserOptedIn,
        optIn,
        optOut,
        requestNotficationPermission,
        featureEnabled,
    } = useNotifications()

    const areNotificationsEnabled = !!isUserOptedIn && !!isNotificationPermissionEnabled
    const hasReachedSubscriptionLimit = Object.keys(tags).length === SUBSCRIPTION_LIMIT

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
            data.forEach(dapp => {
                removeDAppTag(dapp.id)
            })
            setDappNotifications(false)
        } else {
            if (hasReachedSubscriptionLimit) {
                showSubscriptionLimitReachedWarning()
                return
            }
            data.forEach(dapp => {
                addDAppTag(dapp.id)
            })
            setDappNotifications(true)
        }

        updateTags()
    }, [
        addDAppTag,
        data,
        hasReachedSubscriptionLimit,
        removeDAppTag,
        showSubscriptionLimitReachedWarning,
        updateTags,
        tags,
    ])

    const ListHeaderComponent = useMemo(() => {
        return (
            <>
                <BaseCard>
                    <BaseView flex={1} flexDirection="column">
                        <EnableFeature
                            title={LL.PUSH_NOTIFICATIONS_ACTIVE()}
                            onValueChange={toggleNotificationsSwitch}
                            value={areNotificationsEnabled}
                        />
                    </BaseView>
                </BaseCard>
                <BaseSpacer height={24} />

                {areNotificationsEnabled && (
                    <>
                        <BaseText typographyFont="subSubTitle">{LL.PUSH_NOTIFICATIONS_UPDATES()}</BaseText>
                        <BaseSpacer height={16} />
                        <EnableFeature
                            title={LL.VECHAIN_NEWS_AND_UPDATES()}
                            onValueChange={toogleSubscriptionSwitch(vechainNewsAndUpdates)}
                            value={!!tags[vechainNewsAndUpdates]}
                        />
                        <BaseSpacer height={40} />

                        <BaseText typographyFont="subSubTitle">{LL.PUSH_NOTIFICATIONS_VEBETTERDAO()}</BaseText>
                        <BaseSpacer height={16} />
                        <EnableFeature
                            title={LL.PUSH_NOTIFICATIONS_VOTE_REMINDER()}
                            onValueChange={toogleSubscriptionSwitch(voteReminderTagKey)}
                            value={!!tags[voteReminderTagKey]}
                        />
                        <BaseSpacer height={40} />
                        {isMainnet && (
                            <>
                                <BaseText typographyFont="subSubTitle">{LL.PUSH_NOTIFICATIONS_DAPPS()}</BaseText>
                                <BaseSpacer height={16} />
                                <EnableFeature
                                    title={LL.PUSH_NOTIFICATIONS_DAPPS_DESC()}
                                    onValueChange={toogleDAppSubscriptionSwitch}
                                    value={dappNotifications}
                                />
                            </>
                        )}
                    </>
                )}
                <BaseSpacer height={12} />
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

    useEffect(() => {
        if (data.length > 0) {
            const allEnabled = data.every(dapp => !!tags[dapp.id])
            setDappNotifications(allEnabled)

            // If notifications are enabled for all dapps, subscribe any new ones
            if (allEnabled) {
                data.forEach(dapp => {
                    if (!tags[dapp.id]) {
                        addDAppTag(dapp.id)
                    }
                })
                updateTags()
            }
        }
    }, [data, tags, addDAppTag, updateTags])

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

const baseStyle = () =>
    StyleSheet.create({
        skeletonCard: {
            height: 31,
            width: "100%",
            marginBottom: 12,
        },
    })
