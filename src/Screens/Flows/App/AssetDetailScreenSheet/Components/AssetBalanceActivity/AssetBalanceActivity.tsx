import React, { useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseSimpleTabs, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useAccountTokenActivities } from "~Hooks/useAccountTokenActivities"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { ActivityTab } from "./ActivityTab"
import { BalanceTab } from "./BalanceTab"

const TABS = ["BALANCE", "ACTIVITY"] as const

export const AssetBalanceActivity = ({ token }: { token: FungibleTokenWithBalance }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("BALANCE")

    const labels = useMemo(() => [LL.TOKEN_DETAIL_BALANCE_TAB(), LL.TOKEN_DETAIL_ACTIVITY_TAB()], [LL])

    const { data, isLoading } = useAccountTokenActivities(token)

    const disabledKeys = useMemo<(typeof TABS)[number][]>(() => {
        if (!data?.data?.length && !isLoading) return ["ACTIVITY"]
        return []
    }, [data?.data?.length, isLoading])

    return (
        <BaseView
            bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_50}
            px={16}
            py={24}
            mx={16}
            borderRadius={16}
            gap={24}>
            <BaseSimpleTabs
                keys={TABS}
                labels={labels}
                selectedKey={selectedTab}
                setSelectedKey={setSelectedTab}
                rootStyle={styles.tabsRoot}
                innerContainerStyle={styles.tabsInner}
                disabledKeys={disabledKeys}
            />
            {selectedTab === "BALANCE" && <BalanceTab token={token} />}
            {selectedTab === "ACTIVITY" && <ActivityTab token={token} />}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {},
        tabsInner: {
            justifyContent: "space-around",
        },
        tabsRoot: {
            width: "100%",
        },
    })
