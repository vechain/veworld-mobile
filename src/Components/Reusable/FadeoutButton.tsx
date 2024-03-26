import { DimensionValue, StyleSheet } from "react-native"
import React from "react"
import LinearGradient from "react-native-linear-gradient"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { SCREEN_WIDTH } from "~Constants"
import { useTheme } from "~Hooks"
import { BaseButton, BaseView } from "~Components/Base"

type Props = {
    title: string
    action: () => void
    disabled?: boolean
    isLoading?: boolean
    bottom?: number
    mx?: number
    width?: DimensionValue
    testID?: string
}

const IS_CI_BUILD = process.env.IS_CI_BUILD_ENABLED === "true"

export const FadeoutButton = ({
    title,
    action,
    disabled = false,
    isLoading = false,
    bottom,
    mx,
    width,
    testID,
}: Props) => {
    const tabBarHeight = useBottomTabBarHeight()
    const theme = useTheme()

    if (IS_CI_BUILD) {
        return (
            <BaseButton
                accessible
                testID={testID}
                disabled={disabled}
                size="lg"
                haptics="Medium"
                w={100}
                title={title}
                action={action}
                activeOpacity={0.94}
                isLoading={isLoading}
            />
        )
    }

    return (
        <LinearGradient
            style={[
                baseStyles.container,
                {
                    width: width ?? "100%",
                    bottom: bottom ?? tabBarHeight,
                },
            ]}
            colors={[theme.colors.backgroundTransparent, theme.colors.background]}>
            <BaseView mx={mx ?? 20} style={{ width: SCREEN_WIDTH - 40 }} pb={24}>
                <BaseButton
                    accessible
                    testID={testID}
                    disabled={disabled}
                    size="lg"
                    haptics="Medium"
                    w={100}
                    title={title}
                    action={action}
                    activeOpacity={0.94}
                    isLoading={isLoading}
                />
            </BaseView>
        </LinearGradient>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        position: "absolute",
    },
})
