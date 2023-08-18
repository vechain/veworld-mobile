import { useNavigation } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import { SafeAreaViewProps } from "react-native-safe-area-context"
import { usePlatformBottomInsets, useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { getTabbar } from "../Helpers/getTabbar"
import { SafeAreaView } from "./SafeAreaView"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

type Props = {
    bg?: string
    transparent?: boolean
    children?: React.ReactNode
    grow?: number
    isSafeViewNative?: boolean
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
    const { calculateBottomInsets } = usePlatformBottomInsets()

    const [isTab, setIsTab] = useState(false)

    const { styles: themedStyles } = useThemedStyles(
        baseStyles({
            isTab,
            calculateBottomInsets,
            flexGrow,
            bgTransparent,
            bg,
        }),
    )

    useEffect(() => {
        if (nav && nav.getState()) {
            const tab = getTabbar(nav)
            if (tab) {
                setIsTab(true)
            } else {
                setIsTab(false)
            }
        }
    }, [nav, calculateBottomInsets])

    return (
        <SafeAreaView
            style={[
                isAndroid() ? themedStyles.androidTopPadding : {},
                themedStyles.container,
                style,
            ]}
            {...otherProps}>
            {children}
        </SafeAreaView>
    )
}

type BaseStylesProps = {
    isTab: boolean
    calculateBottomInsets: number
    flexGrow?: number
    bgTransparent: boolean
    bg?: string
}

const baseStyles =
    ({
        isTab,
        calculateBottomInsets,
        flexGrow,
        bgTransparent,
        bg,
    }: BaseStylesProps) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            container: {
                paddingBottom: isTab ? calculateBottomInsets : 0,
                flexGrow,
                backgroundColor: bgTransparent
                    ? "transparent"
                    : bg || theme.colors.background,
            },
            androidTopPadding: {
                paddingTop: 12,
            },
        })
