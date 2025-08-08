import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseTouchable, BaseView, HeaderStyleV2, HeaderTitle, Layout } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { VbdCarousel } from "./Components/Common/VbdCarousel/VbdCarousel"

export const AppsScreen = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const goToSearch = useCallback(() => {
        nav.navigate(Routes.APPS_SEARCH)
    }, [nav])

    return (
        <Layout
            bg={theme.isDark ? COLORS.DARK_PURPLE : COLORS.WHITE}
            noBackButton
            fixedHeader={
                <BaseView style={HeaderStyleV2}>
                    <HeaderTitle
                        title={LL.APPS_SCREEN_TITLE()}
                        leftIconName="icon-apps"
                        testID="AppsScreen_HeaderTitle"
                    />
                    <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                        <BaseSpacer width={8} />
                        <BaseTouchable
                            action={goToSearch}
                            haptics="Light"
                            testID="AppsScreen_SearchButton"
                            style={styles.iconContainer}>
                            <BaseIcon name={"icon-search"} size={16} color={theme.colors.text} />
                        </BaseTouchable>
                    </BaseView>
                </BaseView>
            }
            body={
                <VbdCarousel
                    appIds={[
                        "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
                        "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a",
                        "0x6a825c7d259075d70a88cbd1932604ee3009777e14645ced6881a32b9c165ca4",
                    ]}
                />
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        iconContainer: {
            padding: 8,
            borderRadius: 100,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.GREY_100,
        },
    })
