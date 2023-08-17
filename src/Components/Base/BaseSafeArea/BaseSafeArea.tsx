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
    const { iosSpecificBottomInsetsIfIos } = usePlatformBottomInsets()

    const [isTab, setIsTab] = useState(false)

    const { styles: themedStyles } = useThemedStyles(
        baseStyles({
            isTab,
            iosSpecificBottomInsetsIfIos,
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
    }, [nav, iosSpecificBottomInsetsIfIos])

    return (
        <SafeAreaView style={[themedStyles.container, style]} {...otherProps}>
            {children}
        </SafeAreaView>
    )
}

type BaseStylesProps = {
    isTab: boolean
    iosSpecificBottomInsetsIfIos: number
    flexGrow?: number
    bgTransparent: boolean
    bg?: string
}

const baseStyles =
    ({
        isTab,
        iosSpecificBottomInsetsIfIos,
        flexGrow,
        bgTransparent,
        bg,
    }: BaseStylesProps) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            container: {
                marginTop: isAndroid() ? 12 : 0,
                paddingBottom: isTab ? iosSpecificBottomInsetsIfIos : 0,
                flexGrow,
                backgroundColor: bgTransparent
                    ? "transparent"
                    : bg || theme.colors.background,
            },
        })
