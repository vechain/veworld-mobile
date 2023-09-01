import React from "react"
import { useTheme } from "~Hooks"
import { StyleSheet } from "react-native"
import { BaseSkeleton } from "~Components"

export const SkeletonCustomTokenBox = () => {
    const theme = useTheme()

    return (
        <BaseSkeleton
            containerStyle={baseStyles.container}
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[
                // Here we create a row with a circle and two lines
                // which are a similar layout to the activity boxes
                {
                    flexDirection: "row",
                    alignItems: "center",
                    height: 38,
                    children: [
                        // Circle
                        { width: 38, height: 38, borderRadius: 45 / 2 },
                        // Lines
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: "100%",
                            children: [
                                // Line
                                {
                                    width: "40%",
                                    height: 10,
                                    marginLeft: 8,
                                },
                                // Short line
                                {
                                    marginTop: 8,
                                    width: "20%",
                                    height: 8,
                                    marginLeft: 8,
                                },
                            ],
                        },
                    ],
                },
            ]}
        />
    )
}

const baseStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
    },
})
