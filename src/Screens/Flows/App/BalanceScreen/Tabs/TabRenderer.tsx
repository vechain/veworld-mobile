import React, { useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSimpleTabs, BaseSpacer, BaseView } from "~Components"
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

const TABS = ["TOKENS", "STAKING", "COLLECTIBLES"] as const

type Props = {
    onLayout: (e: LayoutChangeEvent) => void
}

export const TabRenderer = ({ onLayout }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
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
            {showFavorites && (
                <BaseView flexDirection="column">
                    <FavouritesV2
                        bookmarkedDApps={bookmarkedDApps}
                        onDAppPress={onDAppPress}
                        renderCTASeeAll={false}
                        style={styles.favorites}
                        iconBg={theme.isDark ? COLORS.DARK_PURPLE : undefined}
                    />
                    <BaseSpacer height={24} />
                </BaseView>
            )}
            <BaseSimpleTabs keys={TABS} labels={labels} selectedKey={selectedTab} setSelectedKey={setSelectedTab} />
            <BaseView flexDirection="column">{selectedTab === "TOKENS" ? <Tokens /> : null}</BaseView>
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
