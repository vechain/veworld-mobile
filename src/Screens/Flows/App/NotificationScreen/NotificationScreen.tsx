import { useFocusEffect } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import {
    AnimatedSearchBar,
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
import { useThemedStyles, useVeBetterDaoDapps } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VeBetterDaoDapp } from "~Model"

const SUBSCRIPTION_LIMIT = 10

export const NotificationScreen = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyle)
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

    const areNotificationsEnabled = isUserOptedIn && isNotificationPermissionEnabled

    const updateTags = useCallback(() => {
        getTags().then(setTags)
    }, [getTags])

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
            optOut()
        }
    }, [featureEnabled, isNotificationPermissionEnabled, isUserOptedIn, optIn, optOut, requestNotficationPermission])

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
        return <BaseSpacer height={12} />
    }, [])

    const ListHeaderComponent = useMemo(() => {
        return (
            <>
                <BaseText typographyFont="title">{LL.PUSH_NOTIFICATIONS()}</BaseText>
                <BaseSpacer height={12} />
                <EnableFeature
                    title={LL.PUSH_NOTIFICATIONS_ACTIVE()}
                    onValueChange={toggleNotificationsSwitch}
                    value={areNotificationsEnabled}
                />
                {areNotificationsEnabled && (
                    <>
                        <BaseSpacer height={12} />
                        <AnimatedSearchBar
                            placeholder={LL.PUSH_NOTIFICATIONS_PREFERENCES_PLACEHOLDER()}
                            value={searchText}
                            iconColor={theme.colors.primary}
                            onTextChange={setSearchText}
                        />
                    </>
                )}
                <BaseSpacer height={12} />
            </>
        )
    }, [LL, areNotificationsEnabled, searchText, theme.colors.primary, toggleNotificationsSwitch])

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
                data={areNotificationsEnabled ? dapps : []}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={renderSeparator}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={ListHeaderComponent}
            />
        ) : (
            Skeleton
        )
    }, [ListHeaderComponent, Skeleton, areNotificationsEnabled, dapps, error, isPending, renderItem, renderSeparator])

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
