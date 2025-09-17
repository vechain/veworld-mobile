/* eslint-disable react-native/no-inline-styles */
import { useQueryClient } from "@tanstack/react-query"
import { default as React, useCallback, useMemo, useState } from "react"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { RefreshControl } from "react-native-gesture-handler"
import LinearGradient from "react-native-linear-gradient"
import { BaseSimpleTabs, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectCurrencySymbol, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { useTokenBalances } from "../HomeScreen/Hooks"
import { GlassButtonWithLabel } from "./Components/GlassButton"
import { Header } from "./Header"
import { ScrambleText } from "./ScrambleText"
import { Tokens } from "./Tabs/Tokens"

const TABS = ["TOKENS", "STAKING", "COLLECTIBLES"] as const

export const BalanceScreen = () => {
    const { LL } = useI18nContext()
    const currencySymbol = useAppSelector(selectCurrencySymbol)

    const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("TOKENS")

    const labels = useMemo(() => TABS.map(tab => LL[`BALANCE_TAB_${tab}`]()), [LL])

    const theme = useTheme()

    const queryClient = useQueryClient()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const [refreshing, setRefreshing] = useState(false)
    const { updateBalances, updateSuggested } = useTokenBalances()

    const invalidateStargateQueries = useCallback(async () => {
        await queryClient.invalidateQueries({
            predicate(query) {
                if (!["userStargateNodes", "userStargateNfts"].includes(query.queryKey[0] as string)) return false
                if (query.queryKey.length < 3) return false
                if (query.queryKey[1] !== selectedNetwork.type) return false
                if (!AddressUtils.compareAddresses(query.queryKey[2] as string | undefined, selectedAccount.address))
                    return false
                return true
            },
        })
    }, [queryClient, selectedAccount.address, selectedNetwork.type])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        await Promise.all([updateBalances(true), updateSuggested(), invalidateStargateQueries()])

        setRefreshing(false)
    }, [invalidateStargateQueries, updateBalances, updateSuggested])

    return (
        <Layout
            bg={COLORS.BALANCE_BACKGROUND}
            noBackButton
            fixedHeader={<Header />}
            noMargin
            fixedBody={
                <NestableScrollContainer
                    refreshControl={
                        <RefreshControl onRefresh={onRefresh} tintColor={theme.colors.border} refreshing={refreshing} />
                    }>
                    <LinearGradient
                        colors={[COLORS.BALANCE_BACKGROUND, "rgba(29, 23, 58, 0.50)", COLORS.PURPLE]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ position: "relative", marginTop: 16 }}
                        locations={[0, 0.6524, 1]}
                        angle={180}>
                        <BaseView flexDirection="row" gap={4} alignSelf="center">
                            <BaseText typographyFont="headerTitle" fontWeight="400" color={COLORS.PURPLE_LABEL}>
                                {currencySymbol}
                            </BaseText>
                            <ScrambleText text="99.999" />
                        </BaseView>

                        <BaseSpacer height={12} />
                        {/* The 24px container should be the pagination */}
                        <BaseSpacer height={24} />
                        <BaseSpacer height={12} />

                        <BaseView alignSelf="center" flexDirection="row" gap={24}>
                            <GlassButtonWithLabel label={LL.BALANCE_ACTION_BUY()} icon="icon-plus" onPress={() => {}} />
                            <GlassButtonWithLabel
                                label={LL.BALANCE_ACTION_RECEIVE()}
                                icon="icon-arrow-down"
                                onPress={() => {}}
                            />
                            <GlassButtonWithLabel
                                label={LL.BALANCE_ACTION_SEND()}
                                icon="icon-arrow-up"
                                onPress={() => {}}
                            />
                            <GlassButtonWithLabel
                                label={LL.BALANCE_ACTION_OTHER()}
                                icon="icon-more-vertical"
                                onPress={() => {}}
                            />
                        </BaseView>

                        <BaseSpacer height={64} />
                    </LinearGradient>

                    <BaseView
                        style={{
                            transform: [{ translateY: -24 }],
                            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.LIGHT_GRAY,
                            padding: 16,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                        }}
                        gap={16}>
                        <BaseSimpleTabs
                            keys={TABS}
                            labels={labels}
                            selectedKey={selectedTab}
                            setSelectedKey={setSelectedTab}
                        />
                        <BaseView>{selectedTab === "TOKENS" ? <Tokens /> : null}</BaseView>
                    </BaseView>
                </NestableScrollContainer>
            }
        />
    )
}
