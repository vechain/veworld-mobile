import React, { ReactNode } from "react"
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import { BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"

type Props = {
    children: ReactNode
    testID?: string
    action: () => void
    rounded?: boolean
    circled?: boolean
    style?: StyleProp<ViewStyle>
}

export const HeaderIconButton = ({ children, testID, action, rounded = false, circled = false, style }: Props) => {
    const theme = useTheme()

    return (
        <TouchableOpacity testID={testID} onPress={action} activeOpacity={0.7}>
            <BaseView
                p={7}
                bg={theme.colors.card}
                flexDirection="row"
                style={[
                    styles.container,
                    { borderColor: theme.colors.rightIconHeaderBorder },
                    rounded && styles.rounded,
                    circled && styles.circled,
                    style,
                ]}>
                {children}
            </BaseView>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: 32,
        borderWidth: 1,
        borderRadius: 6,
        alignContent: "space-between",
    },
    rounded: {
        borderRadius: 8,
    },
    circled: {
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
})
