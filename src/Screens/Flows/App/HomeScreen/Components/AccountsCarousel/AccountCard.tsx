import React, { memo } from "react"
import { StyleProp, ViewStyle, ViewProps, StyleSheet } from "react-native"
import type { AnimateProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import { useTheme, useThemedStyles } from "~Common"
import { BaseText, BaseView } from "~Components"
import { ThemeType } from "~Model"
import { Account } from "~Storage"

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>
    account: Account
}

export const AccountCard: React.FC<Props> = memo(props => {
    const { style, account, ...animatedViewProps } = props
    const theme = useTheme()
    const themedStyle = useThemedStyles(baseStyles)
    return (
        <Animated.View style={themedStyle.container} {...animatedViewProps}>
            <BaseView
                background={theme.colors.primary}
                isFlex
                justify="center"
                align="center"
                radius={24}
                px={16}
                py={16}
                style={style}>
                <BaseText color={theme.colors.tertiary}>
                    {account.address}
                </BaseText>
            </BaseView>
        </Animated.View>
    )
})

const baseStyles = (theme: ThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        itemContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
            borderRadius: 24,
        },
    })
