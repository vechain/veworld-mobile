import React from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import Animated from "react-native-reanimated"

interface TokenContainerProps {
    children: React.ReactNode
    onPress?: () => void
}

export const TokenContainer = ({ children, onPress }: TokenContainerProps) => {
    const { styles } = useThemedStyles(baseStyles)

    const Container = onPress ? TouchableOpacity : React.Fragment
    const containerProps = onPress
        ? {
              activeOpacity: 0.6,
              onPress,
          }
        : {}

    return (
        <BaseView px={20} mb={8}>
            <Container {...containerProps}>
                <Animated.View style={styles.container}>{children}</Animated.View>
            </Container>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            alignItems: "center",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 14,
            backgroundColor: theme.colors.pressableCardBackground,
            borderColor: theme.colors.pressableCardBorder,
            borderWidth: 1,
        },
    })
