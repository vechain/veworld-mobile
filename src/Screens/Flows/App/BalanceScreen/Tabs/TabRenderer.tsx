import React, { useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import { BaseSimpleTabs, BaseSpacer, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { Tokens } from "./Tokens"
import { FavouritesV2 } from "../../AppsScreen/Components/Favourites/FavouritesV2"
import { selectBookmarkedDapps } from "~Storage/Redux/Selectors"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { useDAppActions } from "../../AppsScreen/Hooks/useDAppActions"

const TABS = ["TOKENS", "STAKING", "COLLECTIBLES"] as const

type Props = {
    onLayout: (e: LayoutChangeEvent) => void
}

export const TabRenderer = ({ onLayout }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("TOKENS")
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const { onDAppPress } = useDAppActions(Routes.HOME)
    const showFavorites = bookmarkedDApps.length > 0
    const labels = useMemo(() => TABS.map(tab => LL[`BALANCE_TAB_${tab}`]()), [LL])
    return (
        <BaseView style={styles.root} gap={16} onLayout={onLayout}>
            {showFavorites && (
                <>
                    <FavouritesV2
                        bookmarkedDApps={bookmarkedDApps}
                        onDAppPress={onDAppPress}
                        renderCTASeeAll={false}
                        style={styles.favorites}
                    />
                    <BaseSpacer height={8} />
                </>
            )}
            <BaseSimpleTabs keys={TABS} labels={labels} selectedKey={selectedTab} setSelectedKey={setSelectedTab} />
            <BaseView>{selectedTab === "TOKENS" ? <Tokens /> : null}</BaseView>
        </BaseView>
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
        },
        favorites: {
            marginLeft: -16,
        },
    })
