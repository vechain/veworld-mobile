/* eslint-disable react-native/no-inline-styles */
import { useQueryClient } from "@tanstack/react-query"
import { default as React, useCallback, useMemo, useState } from "react"
import { TouchableOpacity } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { RefreshControl } from "react-native-gesture-handler"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseSimpleTabs, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { ShadowView } from "~Components/Reusable/ShadowView"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { selectCurrencySymbol, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { useTokenBalances } from "../HomeScreen/Hooks"
import { Header } from "./Header"
import { ScrambleText } from "./ScrambleText"
import { Tokens } from "./Tabs/Tokens"

const GlassButton = ({ icon }: { icon: IconKey }) => {
    return (
        <TouchableOpacity>
            {/* <LinearShadowView
                inset
                from="top"
                to="bottom"
                colors={["black", "white"]}
                shadowOffset={{ height: -4, width: 0 }}
                shadowBlur={4}
                style={{ padding: 12, borderRadius: 99 }}
                isReflectedLightEnabled={false}>
                <BaseIcon name={icon} size={24} color={COLORS.PURPLE_LABEL} />
            </LinearShadowView> */}
            <LinearGradient
                colors={["rgba(29, 23, 58, 0.20)", "rgba(177, 168, 220, 0.20)"]}
                angle={0}
                style={{ borderRadius: 99 }}>
                <ShadowView
                    inset
                    backgroundColor="transparent"
                    shadowColor="rgba(214, 212, 227, 0.10)"
                    shadowOffset={{ height: 4, width: 0 }}
                    shadowBlur={4}
                    style={{ padding: 12, borderRadius: 99 }}>
                    <BaseIcon name={icon} size={24} color={COLORS.PURPLE_LABEL} />
                </ShadowView>
            </LinearGradient>
            {/* <ShadowView
                backgroundColor="transparent"
                shadowColor="rgba(214, 212, 227, 0.10)"
                shadowOffset={{ height: 4, width: 0 }}
                shadowBlur={4}
                style={{ padding: 12, borderRadius: 99 }}>
                <BaseIcon name={icon} size={24} color={COLORS.PURPLE_LABEL} />
            </ShadowView> */}
            {/* <LinearGradient
                colors={["rgba(29, 23, 58, 0.20)", "rgba(177, 168, 220, 0.20)"]}
                angle={0}
                style={{ padding: 12, borderRadius: 99 }}>
                <BaseIcon name={icon} size={24} color={COLORS.PURPLE_LABEL} />
            </LinearGradient> */}
        </TouchableOpacity>
    )
}

const GlassButtonFull = ({ label, icon }: { label: string; icon: IconKey }) => {
    return (
        <BaseView flexDirection="column" gap={8} alignItems="center">
            <GlassButton icon={icon} />
            <BaseText typographyFont="captionSemiBold" color={COLORS.PURPLE_LABEL}>
                {label}
            </BaseText>
        </BaseView>
    )
}

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
                            <GlassButtonFull label="buy" icon="icon-plus" />
                            <GlassButtonFull label="receive" icon="icon-arrow-down" />
                            <GlassButtonFull label="send" icon="icon-arrow-up" />
                            <GlassButtonFull label="other" icon="icon-more-vertical" />
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
