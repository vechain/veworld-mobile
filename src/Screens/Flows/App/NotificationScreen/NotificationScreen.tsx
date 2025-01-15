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
import { newDappsListedTagKey, veWorldFeatureUpdateTagKey, voteReminderTagKey } from "~Constants"
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
    const { getTags, addTag, removeTag } = useNotifications()

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

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<VeBetterDaoDapp>) => {
            const id = item.id
            const value = !!tags[id]

            const onSwitchChange = (_value: boolean) => {
                if (_value) {
                    if (Object.keys(tags).length === SUBSCRIPTION_LIMIT) {
                        showWarningToast({
                            text1: LL.PUSH_NOTIFICATIONS_SUBSCRIPTION_LIMIT_REACHED_TITLE(),
                            text2: LL.PUSH_NOTIFICATIONS_SUBSCRIPTION_LIMIT_REACHED_DESC(),
                        })
                        return
                    }

                    addTag(id, "true")
                } else {
                    removeTag(id)
                }

                updateTags()
            }

            return <EnableFeature title={item.name} onValueChange={onSwitchChange} value={value} />
        },
        [LL, addTag, removeTag, tags, updateTags],
    )

    const renderSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

    const onVeWorldFeatureAndUpdatePress = useCallback(
        (newValue: boolean) => {
            if (newValue) {
                addTag(veWorldFeatureUpdateTagKey, "true")
            } else {
                removeTag(veWorldFeatureUpdateTagKey)
            }

            updateTags()
        },
        [addTag, removeTag, updateTags],
    )

    const onNewDappsListedPress = useCallback(
        (newValue: boolean) => {
            if (newValue) {
                addTag(newDappsListedTagKey, "true")
            } else {
                removeTag(newDappsListedTagKey)
            }

            updateTags()
        },
        [addTag, removeTag, updateTags],
    )

    const onVoteReminderPress = useCallback(
        (newValue: boolean) => {
            if (newValue) {
                addTag(voteReminderTagKey, "true")
            } else {
                removeTag(voteReminderTagKey)
            }

            updateTags()
        },
        [addTag, removeTag, updateTags],
    )

    const ListHeaderComponent = useMemo(() => {
        return (
            <>
                <BaseText typographyFont="title">{LL.PUSH_NOTIFICATIONS()}</BaseText>
                <BaseSpacer height={12} />
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
                            title={LL.PUSH_NOTIFICATIONS_VEWORLD_FEATURE_AND_UPDATE()}
                            onValueChange={onVeWorldFeatureAndUpdatePress}
                            value={!!tags[veWorldFeatureUpdateTagKey]}
                        />
                        <BaseSpacer height={16} />
                        <EnableFeature
                            title={LL.PUSH_NOTIFICATIONS_NEW_APP_LISTED()}
                            onValueChange={onNewDappsListedPress}
                            value={!!tags[newDappsListedTagKey]}
                        />
                        <BaseSpacer height={40} />

                        <BaseText typographyFont="subSubTitle">{LL.PUSH_NOTIFICATIONS_VEBETTERDAO()}</BaseText>
                        <BaseSpacer height={16} />
                        <EnableFeature
                            title={LL.PUSH_NOTIFICATIONS_VOTE_REMINDER()}
                            onValueChange={onVoteReminderPress}
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
        onNewDappsListedPress,
        onVeWorldFeatureAndUpdatePress,
        onVoteReminderPress,
        searchText,
        tags,
        theme.colors.primary,
        toggleNotificationsSwitch,
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
