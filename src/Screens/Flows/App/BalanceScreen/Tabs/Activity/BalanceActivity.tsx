import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation"
import { ActivityItemRenderer } from "~Screens/Flows/App/ActivityScreen/Components/ActivityItemRenderer"
import { SkeletonActivity } from "../../Components/Activity/SkeletonActivity"
import { useActivityTimestampRenderer } from "../../Hooks/useActivityTimestampRenderer"
import { useBalanceActivities } from "../../Hooks/useBalanceActivities"
import { BalanceTab } from "../types"

const ItemSeparatorComponent = () => <BaseSpacer height={8} />
const ListFooterComponent = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(footerStyles)
    const onNavigate = useCallback(() => {
        nav.navigate(Routes.HISTORY_STACK, { screen: Routes.HISTORY })
    }, [nav])
    return (
        <BaseButton
            variant="ghost"
            px={0}
            py={4}
            action={onNavigate}
            typographyFont="bodyMedium"
            style={styles.btn}
            textColor={theme.colors.text}
            rightIcon={<BaseIcon name="icon-arrow-right" size={14} style={styles.icon} color={theme.colors.text} />}>
            {LL.ACTIVITY_SEE_ALL()}
        </BaseButton>
    )
}

const footerStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 2,
        },
        btn: {
            marginTop: 16,
        },
    })

const LOADING_ITEMS = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }]

export const BalanceActivity = ({ tab }: { tab: BalanceTab }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const nav = useNavigation()

    const timestampRenderer = useActivityTimestampRenderer()

    const { data, isLoading } = useBalanceActivities({ tab })

    const onActivityPress = useCallback(
        (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => {
            nav.navigate(Routes.ACTIVITY_DETAILS, {
                activity,
                token,
                isSwap,
                decodedClauses,
                returnScreen: Routes.HOME,
            })
        },
        [nav],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<Activity>) => {
            return (
                <ActivityItemRenderer activity={item} onPress={onActivityPress} timestampRenderer={timestampRenderer} />
            )
        },
        [onActivityPress, timestampRenderer],
    )

    const renderLoadingItem = useCallback(() => {
        return <SkeletonActivity />
    }, [])

    if (!isLoading && data?.length === 0) return null

    return (
        <BaseView flexDirection="column" gap={16}>
            <BaseText typographyFont="subSubTitleSemiBold" color={theme.isDark ? COLORS.GREY_100 : COLORS.DARK_PURPLE}>
                {LL.ACTIVITY()}
            </BaseText>
            {isLoading ? (
                <FlatList
                    renderItem={renderLoadingItem}
                    data={LOADING_ITEMS}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    keyExtractor={item => item.id}
                />
            ) : (
                <FlatList
                    renderItem={renderItem}
                    data={data ?? []}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    keyExtractor={item => item.id}
                    ListFooterComponent={ListFooterComponent}
                />
            )}
        </BaseView>
    )
}
