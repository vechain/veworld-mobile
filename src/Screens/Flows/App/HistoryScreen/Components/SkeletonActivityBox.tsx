import React from "react"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { BaseSkeleton } from "~Components"

export const SkeletonActivityBox = () => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseSkeleton
            containerStyle={styles.container}
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[
                // Here we create a row with a circle and two lines
                // which are a similar layout to the activity boxes
                {
                    flexDirection: "row",
                    alignItems: "center",
                    height: 65,
                    children: [
                        // Circle
                        { width: 40, height: 40, borderRadius: 20 },
                        // Lines
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: "100%",
                            children: [
                                // Line
                                {
                                    width: "40%",
                                    height: 18,
                                    marginLeft: 10,
                                },
                                // Short line
                                {
                                    marginTop: 6,
                                    width: "30%",
                                    height: 14,
                                    marginLeft: 10,
                                },
                            ],
                        },
                    ],
                },
            ]}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
            width: "100%",
            flexDirection: "column",
            marginLeft: -1,
            borderBottomColor: theme.colors.skeletonBoneColor,
            borderBottomWidth: 0.5,
        },
    })
