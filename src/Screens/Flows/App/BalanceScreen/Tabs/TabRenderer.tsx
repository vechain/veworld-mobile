import React, { useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseButton, BaseSimpleTabs, BaseSpacer, BaseText, BaseView, Icon } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectBookmarkedDapps, selectSelectedAccount } from "~Storage/Redux/Selectors"
import { AccountUtils } from "~Utils"
import { FavouritesV2 } from "../../AppsScreen/Components/Favourites/FavouritesV2"
import { useDAppActions } from "../../AppsScreen/Hooks/useDAppActions"
import { Tokens } from "./Tokens"
import { B3trLogoSVG, VeBetterFullLogoSVG } from "~Assets"
import { StatsCard } from "../Components/VeBetterDao/StatsCard"

const TABS = ["TOKENS", "STAKING", "COLLECTIBLES"] as const

type Props = {
    onLayout: (e: LayoutChangeEvent) => void
}

const NewUserVeBetterCard = () => {
    const { styles, theme } = useThemedStyles(style)
    const { LL } = useI18nContext()

    return (
        <BaseView style={styles.root} testID="VEBETTER_DAO_NEW_USER_CARD">
            <BaseView flexDirection="column" gap={16}>
                <BaseView flexDirection="row" gap={6}>
                    <BaseText typographyFont="body" color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE}>
                        {LL.VBD_JOIN_THE()}
                    </BaseText>
                    <VeBetterFullLogoSVG height={16} />
                    <BaseText color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE}>{LL.VBD_MOVEMENT()}</BaseText>
                </BaseView>

                <BaseView pt={20} px={24} pb={20} gap={16} flexDirection="column" style={styles.inner}>
                    <BaseView flexDirection="row" gap={12} justifyContent="space-between" alignItems="center">
                        <Icon name="icon-leafs" color={COLORS.LIME_GREEN} size={24} />
                        <BaseText>{LL.VBD_TOTAL_ACTIONS()}</BaseText>
                        <BaseText>{"999.9M"}</BaseText>
                    </BaseView>
                    <BaseView flexDirection="row" gap={12} justifyContent="space-between" w={100}>
                        <B3trLogoSVG color={COLORS.LIME_GREEN} width={24} height={24} />
                        <BaseText>{LL.VBD_TOTAL_REWARDED()}</BaseText>
                        <BaseText>{"999.9M"}</BaseText>
                    </BaseView>
                </BaseView>
            </BaseView>

            <BaseView>
                <BaseText>{LL.VBD_GET_REWARDED()}</BaseText>
                <BaseText>{LL.VBD_CONTRIBUTE_OFFSET()}</BaseText>
            </BaseView>

            <BaseView w={100} flexDirection="column" gap={8}>
                <BaseView flexDirection="row" gap={8}>
                    <StatsCard label="co2" value={999} />
                    <StatsCard label="energy" value={999} />
                </BaseView>
                <BaseView flexDirection="row" gap={8}>
                    <StatsCard label="water" value={999} />
                    <StatsCard label="plastic" value={999} />
                </BaseView>
            </BaseView>

            <BaseButton title={LL.VBD_START_YOUR_IMPACT()} action={() => {}} />
        </BaseView>
    )
}

const style = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            gap: 24,
            paddingTop: 32,
            paddingBottom: 24,
            paddingHorizontal: 24,
            position: "relative",
            flexDirection: "column",
            borderRadius: 16,
        },
        actionsText: {
            fontWeight: 600,
            fontSize: 40,
            fontFamily: "Inter-SemiBold",
            lineHeight: 40,
        },
        inner: {
            borderWidth: 1,
            borderColor: "rgba(185, 181, 207, 0.15)",
            backgroundColor: theme.isDark ? "rgba(89, 82, 127, 0.25)" : theme.colors.transparent,
            borderRadius: 16,
            position: "relative",
        },
        b3mo: {
            position: "absolute",
            right: -24,
            top: 8,
            width: 196,
            height: 196,
        },
        b3moImage: {
            width: "100%",
            height: "100%",
        },
    })

export const TabRenderer = ({ onLayout }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("TOKENS")
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { onDAppPress } = useDAppActions(Routes.HOME)
    const showFavorites = useMemo(() => {
        return bookmarkedDApps.length > 0 && !AccountUtils.isObservedAccount(selectedAccount)
    }, [bookmarkedDApps.length, selectedAccount])
    const labels = useMemo(() => TABS.map(tab => LL[`BALANCE_TAB_${tab}`]()), [LL])
    return (
        <Animated.View style={styles.root} onLayout={onLayout}>
            <NewUserVeBetterCard />
            {showFavorites && (
                <>
                    <FavouritesV2
                        bookmarkedDApps={bookmarkedDApps}
                        onDAppPress={onDAppPress}
                        renderCTASeeAll={false}
                        style={styles.favorites}
                    />
                    <BaseSpacer height={24} />
                </>
            )}
            <BaseSimpleTabs keys={TABS} labels={labels} selectedKey={selectedTab} setSelectedKey={setSelectedTab} />
            <BaseView>{selectedTab === "TOKENS" ? <Tokens /> : null}</BaseView>
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            marginTop: -24,
            paddingBottom: 24,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.LIGHT_GRAY,
            padding: 16,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            flex: 1,
            gap: 16,
            flexDirection: "column",
        },
        favorites: {
            marginLeft: -16,
        },
    })
