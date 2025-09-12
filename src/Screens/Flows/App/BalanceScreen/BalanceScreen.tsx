/* eslint-disable react-native/no-inline-styles */
import { default as React, useMemo, useState } from "react"
import { TouchableOpacity } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseSimpleTabs, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { IconKey } from "~Model"
import { selectCurrencySymbol, useAppSelector } from "~Storage/Redux"
import { Header } from "./Header"
import { Tokens } from "./Tabs/Tokens"

const GlassButton = ({ icon }: { icon: IconKey }) => {
    return (
        <TouchableOpacity>
            <LinearGradient
                colors={["rgba(29, 23, 58, 0.20)", "rgba(177, 168, 220, 0.20)"]}
                angle={0}
                style={{ padding: 12, borderRadius: 99 }}>
                <BaseIcon name={icon} size={24} color={COLORS.PURPLE_LABEL} />
            </LinearGradient>
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
    const currencySymbol = useAppSelector(selectCurrencySymbol)

    const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("TOKENS")

    const labels = useMemo(() => ["Tokens", "Staking", "Collectibles"], [])

    const theme = useTheme()

    return (
        <Layout
            bg="#1D173A"
            noBackButton
            fixedHeader={<Header />}
            noMargin
            body={
                <>
                    <LinearGradient
                        colors={["#1D173A", "rgba(29, 23, 58, 0.50)", COLORS.PURPLE]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ position: "relative", marginTop: 16 }}
                        locations={[0, 0.6524, 1]}
                        angle={180}>
                        <BaseView flexDirection="row" gap={4} alignSelf="center">
                            <BaseText typographyFont="headerTitle" fontWeight="400" color={COLORS.PURPLE_LABEL}>
                                {currencySymbol}
                            </BaseText>
                            <BaseText
                                style={{ fontSize: 36, fontWeight: 600, lineHeight: 40, fontFamily: "Inter-SemiBold" }}
                                color={COLORS.GREY_50}>
                                {99.999}
                            </BaseText>
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
                        <BaseView mt={16}>{selectedTab === "TOKENS" ? <Tokens /> : null}</BaseView>
                    </BaseView>
                </>
            }
        />
    )
}
