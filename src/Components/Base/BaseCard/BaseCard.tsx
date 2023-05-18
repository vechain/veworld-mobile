import React, { memo } from "react"
import {
    Pressable,
    StyleProp,
    StyleSheet,
    ViewProps,
    ViewStyle,
} from "react-native"
import DropShadow from "react-native-drop-shadow"
import { useTheme } from "~Common"
import { BaseView } from "../BaseView"

type Props = {
    containerStyle?: StyleProp<ViewStyle>
    selected?: boolean
    onPress?: () => void
}

export const BaseCard = memo(
    ({
        children,
        testID,
        style,
        containerStyle,
        selected,
        onPress,
    }: ViewProps & Props) => {
        const theme = useTheme()
        return (
            <DropShadow
                style={[
                    theme.shadows.card,
                    selected
                        ? // eslint-disable-next-line react-native/no-inline-styles
                          {
                              borderWidth: selected ? 1 : 0,
                              borderRadius: 16,
                              borderColor: theme.colors.text,
                          }
                        : {},
                    styles.container,
                    containerStyle,
                ]}>
                <Pressable onPress={onPress}>
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
                </Pressable>
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
