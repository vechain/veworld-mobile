import { StyleSheet } from "react-native"
import React from "react"
import LinearGradient from "react-native-linear-gradient"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { SCREEN_WIDTH, useTheme, valueToHP } from "~Common"
import { BaseButton, BaseView } from "~Components/Base"

type Props = {
    title: string
    action: () => void
}

export const FadeoutButton = ({ title, action }: Props) => {
    const tabBarHeight = useBottomTabBarHeight()
    const theme = useTheme()

    return (
        <LinearGradient
            style={[
                baseStyles.container,
                {
                    bottom: tabBarHeight,
                },
            ]}
            colors={[
                theme.colors.backgroundTransparent,
                theme.colors.background,
            ]}>
            <BaseView
                mx={20}
                style={{ width: SCREEN_WIDTH - 40 }}
                py={valueToHP[16]}>
                <BaseButton
                    size="lg"
                    haptics="medium"
                    w={100}
                    title={title}
                    action={action}
                    activeOpacity={0.94}
                />
            </BaseView>
        </LinearGradient>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        position: "absolute",
        width: "100%",
    },
})
