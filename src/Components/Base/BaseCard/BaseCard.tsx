import React, { memo } from "react"
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { useTheme } from "~Common"
import { BaseView } from "../BaseView"

type Props = {
    containerStyle?: StyleProp<ViewStyle>
}

export const BaseCard = memo(
    ({ children, testID, style, containerStyle }: ViewProps & Props) => {
        const theme = useTheme()
        return (
            <DropShadow
                style={[theme.shadows.card, styles.container, containerStyle]}>
                <BaseView
                    style={[
                        styles.view,
                        {
                            backgroundColor: theme.colors.card,
                        },
                        style,
                    ]}
                    testID={testID}>
                    {children}
                </BaseView>
            </DropShadow>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    view: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
    },
})
