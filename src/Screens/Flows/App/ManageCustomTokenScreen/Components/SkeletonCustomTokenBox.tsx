import React from "react"
import { useTheme } from "~Hooks"
import { StyleSheet } from "react-native"
import SkeletonContent from "react-native-skeleton-content-nonexpo"

export const SkeletonCustomTokenBox = () => {
    const theme = useTheme()

    return (
        <SkeletonContent
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
                    height: 70,
                    children: [
                        // Circle
                        { width: 45, height: 45, borderRadius: 45 / 2 },
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

const baseStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        marginLeft: -1,
    },
})
