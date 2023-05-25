import React from "react"
import { useTheme } from "~Common"
import { StyleSheet } from "react-native"
import SkeletonContent from "react-native-skeleton-content-nonexpo"

export const SkeletonActivityBox = () => {
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
                                    width: "80%",
                                    height: 20,
                                    marginLeft: 10,
                                },
                                // Short line
                                {
                                    marginTop: 6,
                                    width: "20%",
                                    height: 20,
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
        paddingBottom: 18,
    },
})
