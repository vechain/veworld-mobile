import React from "react"
import { ColorThemeType, useThemedStyles } from "~Common"
import { StyleSheet } from "react-native"
import SkeletonContent from "react-native-skeleton-content-nonexpo"

export const SkeletonActivityBox = () => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <SkeletonContent
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
            isLoading={true}
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
            borderBottomColor: theme.colors.skeletonHighlightColor,
            borderBottomWidth: 0.5,
        },
    })
