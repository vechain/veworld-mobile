import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useNavigation } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context"
import { ColorThemeType, useThemedStyles } from "~Common"
import { PlatformUtils } from "~Utils"
import { getTabbar } from "./Helpers/getTabbar"

type Props = {
    bg?: string
    transparent?: boolean
    children?: React.ReactNode
    grow?: number
} & SafeAreaViewProps

export const BaseSafeArea = ({
    style,
    grow: flexGrow,
    transparent: bgTransparent = false,
    bg,
    children,
    ...otherProps
}: Props) => {
    const nav = useNavigation()
    const tabbarHeight = useBottomTabBarHeight()

    const [isTab, setIsTab] = useState(false)

    const { styles: themedStyles } = useThemedStyles(
        baseStyles({ isTab, tabbarHeight, flexGrow, bgTransparent, bg }),
    )

    useEffect(() => {
        if (nav && nav.getState() && PlatformUtils.isAndroid()) {
            const tab = getTabbar(nav)
            if (tab) {
                setIsTab(true)
            } else {
                setIsTab(false)
            }
        }
    }, [nav, tabbarHeight])

    return (
        <SafeAreaView style={[themedStyles.container, style]} {...otherProps}>
            {children}
        </SafeAreaView>
    )
}

type BaseStylesProps = {
    isTab: boolean
    tabbarHeight: number
    flexGrow?: number
    bgTransparent: boolean
    bg?: string
}

const baseStyles =
    ({ isTab, tabbarHeight, flexGrow, bgTransparent, bg }: BaseStylesProps) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            container: {
                paddingBottom: isTab ? tabbarHeight : 0,
                flexGrow,
                backgroundColor: bgTransparent
                    ? "transparent"
                    : bg || theme.colors.background,
            },
        })
