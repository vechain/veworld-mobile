import React from "react"
import { StyleSheet } from "react-native"
import { BaseSkeleton } from "~Components/Base"
import { useTheme } from "~Hooks"

export const FavoriteDAppCardSkeleton = () => {
    const theme = useTheme()

    return (
        <BaseSkeleton
            containerStyle={baseStyles.container}
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[
                {
                    flexDirection: "row",
                    alignItems: "center",
                    children: [
                        // App icon square
                        {
                            width: 48,
                            height: 48,
                            borderRadius: 4,
                            marginLeft: 4,
                        },
                        // Text content area
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            flex: 1,
                            marginLeft: 24,
                            children: [
                                // App name - wider line
                                {
                                    width: "60%",
                                    height: 16,
                                    borderRadius: 2,
                                },
                                // App description - narrower line
                                {
                                    marginTop: 6,
                                    width: "45%",
                                    height: 12,
                                    borderRadius: 2,
                                },
                            ],
                        },
                        // Action icon
                        {
                            width: 20,
                            height: 20,
                            borderRadius: 2,
                            marginRight: 14,
                            marginLeft: 10,
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
    },
})
