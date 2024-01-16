import React from "react"
import { StyleSheet } from "react-native"
import { BaseSkeleton } from "~Components"
import { useTheme } from "~Hooks"

export const SkeletonActivityBox = () => {
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
                    height: 68,
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
                                    width: "20%",
                                    height: 10,
                                    marginLeft: 12,
                                },
                                // Short line
                                {
                                    marginTop: 10,
                                    width: "30%",
                                    height: 8,
                                    marginLeft: 12,
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
        marginLeft: -1,
    },
})
