/* eslint-disable react-native/no-inline-styles */
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useNavigation } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { ViewProps } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { PlatformUtils, useTheme } from "~Common"
import { getTabbar } from "./Helpers/getTabbar"

type Props = {
    bg?: string
    transparent?: boolean
    children?: React.ReactNode
    grow?: number
} & ViewProps

export const BaseSafeArea = (props: Props) => {
    const { style, ...otherProps } = props
    const theme = useTheme()
    const nav = useNavigation()
    const tabbarHeight = useBottomTabBarHeight()

    const [isTab, setIsTab] = useState(false)

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
        <SafeAreaView
            style={[
                {
                    paddingBottom: isTab ? tabbarHeight : 0,
                    flexGrow: props.grow,
                    backgroundColor: props.transparent
                        ? "transparent"
                        : props.bg
                        ? props.bg
                        : theme.colors.background,
                },
                style,
            ]}
            {...otherProps}>
            {props.children}
        </SafeAreaView>
    )
}
