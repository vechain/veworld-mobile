import React from "react"
import {
    ScrollView,
    ScrollViewProps,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from "react-native"
import { useTheme } from "~Hooks"
import { BaseView } from "./BaseView"

type Props = {
    h?: number
    w?: number
    containerStyle?: StyleProp<ViewStyle>
} & ScrollViewProps

/**
 * NOTE: the wrapper view is needed because you can't set height to a scrollView directly
 * reference: https://stackoverflow.com/questions/49373417/react-native-scrollview-height-always-stays-static-and-does-not-change
 */
export const BaseScrollView = React.forwardRef<ScrollView, Props>(
    ({ h, w, style, containerStyle, ...otherProps }, ref) => {
        const theme = useTheme()

        return (
            <BaseView
                h={h}
                w={w}
                style={[styles.scrollViewContainer, containerStyle]}>
                <ScrollView
                    ref={ref}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.contentContainerStyle}
                    contentInsetAdjustmentBehavior="automatic"
                    style={[
                        styles.scrollView,
                        { backgroundColor: theme.colors.background },
                        style,
                    ]}
                    {...otherProps}
                />
            </BaseView>
        )
    },
)

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        width: "100%",
    },
    contentContainerStyle: {
        flexGrow: 1,
    },
    scrollView: {
        height: "100%",
        width: "100%",
    },
})
