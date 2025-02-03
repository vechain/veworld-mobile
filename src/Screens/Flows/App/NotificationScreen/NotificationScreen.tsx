import { useFocusEffect } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import {
    AnimatedSearchBar,
    BaseCard,
    BaseSkeleton,
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
import { NETWORK_TYPE, VeBetterDaoDapp } from "~Model"
import { selectSelectedNetwork, updateLastNotificationReminder, useAppDispatch, useAppSelector } from "~Storage/Redux"

const SUBSCRIPTION_LIMIT = 10

export const NotificationScreen = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { styles, theme } = useThemedStyles(baseStyle)

    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const isMainnet = selectedNetwork.type === NETWORK_TYPE.MAIN

    const { data = [], error, isPending } = useVeBetterDaoDapps()
    const { getTags, addTag, addDAppTag, removeTag, removeDAppTag } = useNotifications()

    const [dapps, setDapps] = useState<VeBetterDaoDapp[]>([])
    const [tags, setTags] = useState<{ [key: string]: string }>({})
    const [searchText, setSearchText] = useState("")

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

    const filterDapps = useCallback(
        (text: string) => {
            setDapps(prev => {
                const query = text.trim().toLowerCase()
                const result = prev.filter(dapp => dapp.name.toLowerCase().includes(query))
                return query.length > 0 ? result : data
            })
        },
        [data],
    )

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

    const toogleDAppSubscriptionSwitch = useCallback(
        (dappId: string) => (value: boolean) => {
            if (value) {
                if (hasReachedSubscriptionLimit) {
                    showSubscriptionLimitReachedWarning()
                    return
                }

                addDAppTag(dappId)
            } else {
                removeDAppTag(dappId)
            }

            updateTags()
        },
        [addDAppTag, hasReachedSubscriptionLimit, removeDAppTag, showSubscriptionLimitReachedWarning, updateTags],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<VeBetterDaoDapp>) => {
            const id = item.id
            const value = !!tags[id]

            return <EnableFeature title={item.name} onValueChange={toogleDAppSubscriptionSwitch(id)} value={value} />
        },
        [tags, toogleDAppSubscriptionSwitch],
    )

    const renderSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

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
                                <AnimatedSearchBar
                                    placeholder={LL.PUSH_NOTIFICATIONS_PREFERENCES_PLACEHOLDER()}
                                    value={searchText}
                                    iconColor={theme.colors.primary}
                                    onTextChange={setSearchText}
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
        searchText,
        tags,
        theme.colors.primary,
        toggleNotificationsSwitch,
        toogleSubscriptionSwitch,
    ])

    const Skeleton = useMemo(() => {
        return (
            <BaseView>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(value => {
                    return (
                        <BaseSkeleton
                            key={value}
                            animationDirection="horizontalLeft"
                            containerStyle={styles.skeletonCard}
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            layout={[{ flexDirection: "column", height: "100%", width: "100%", borderRadius: 50 }]}
                        />
                    )
                })}
            </BaseView>
        )
    }, [styles.skeletonCard, theme.colors.skeletonBoneColor, theme.colors.skeletonHighlightColor])

    const DappsList = useMemo(() => {
        return !isPending && !error ? (
            <FlatList
                data={areNotificationsEnabled && isMainnet ? dapps : []}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={renderSeparator}
                ListFooterComponent={<BaseSpacer height={40} />}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={ListHeaderComponent}
            />
        ) : (
            Skeleton
        )
    }, [
        ListHeaderComponent,
        Skeleton,
        areNotificationsEnabled,
        dapps,
        error,
        isMainnet,
        isPending,
        renderItem,
        renderSeparator,
    ])

    useEffect(() => {
        filterDapps(searchText)
    }, [filterDapps, searchText])

    useEffect(() => {
        if (data) {
            setDapps(data)
        }
    }, [data])

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
            title={LL.PUSH_NOTIFICATIONS()}
            body={
                <BaseView pt={16} bg={theme.colors.background}>
                    {DappsList}
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
