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
                        {
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                        },
                    ],
                },
                // Lines
                {
                    flexDirection: "column",
                    justifyContent: "center",
                    height: 60,
                    children: [
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: 180,
                            height: 20,
                        },
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: 100,
                            marginVertical: 6,
                            height: 10,
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
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        marginLeft: -1,
    },
})
