import React, { memo } from "react"
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from "react-native"
import { useTheme } from "~Hooks"
import { BaseView } from "../BaseView"

type Props = {
    views: ViewProps[]
    containerStyle?: StyleProp<ViewStyle>
}

export const BaseCardGroup = memo(
    ({ containerStyle, views }: ViewProps & Props) => {
        const theme = useTheme()
        return (
            <BaseView style={[styles.container, containerStyle]}>
                {views.map((view, index) => {
                    const { children, style, ...others } = view
                    const borderTopRadius = index === 0 ? 16 : 0
                    const borderBottomRadius =
                        index === views.length - 1 ? 16 : 0
                    return (
                        <BaseView
                            key={index}
                            style={[
                                styles.view,
                                // eslint-disable-next-line react-native/no-inline-styles
                                {
                                    marginBottom:
                                        index === views.length - 1 ? 0 : 2,
                                    borderTopLeftRadius: borderTopRadius,
                                    borderTopRightRadius: borderTopRadius,
                                    borderBottomLeftRadius: borderBottomRadius,
                                    borderBottomRightRadius: borderBottomRadius,
                                    borderBottomWidth:
                                        index === views.length - 1 ? 0 : 1,
                                    borderBottomColor: theme.colors.background,
                                    backgroundColor: theme.colors.card,
                                },
                                style,
                            ]}
                            {...others}>
                            {children}
                        </BaseView>
                    )
                })}
            </BaseView>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
    },
    view: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
    },
})
