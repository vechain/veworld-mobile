import { StyleSheet } from "react-native"
import React from "react"
import LinearGradient from "react-native-linear-gradient"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { SCREEN_WIDTH, valueToHP } from "~Constants"
import { useTheme } from "~Hooks"
import { BaseButton, BaseView } from "~Components/Base"

type Props = {
    title: string
    action: () => void
    disabled?: boolean
}

export const FadeoutButton = ({ title, action, disabled = false }: Props) => {
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
                    disabled={disabled}
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
