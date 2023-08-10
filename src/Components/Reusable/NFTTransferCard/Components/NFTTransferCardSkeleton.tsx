import React from "react"
import { useTheme } from "~Hooks"
import { StyleSheet } from "react-native"
import { BaseSkeleton } from "~Components/Base"

export const NFTTransferCardSkeleton = () => {
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
                        // NFT square
                        { width: 120, height: 120, borderRadius: 16 },
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
                                    marginLeft: 16,
                                },
                                // Short line
                                {
                                    marginTop: 6,
                                    width: "30%",
                                    height: 14,
                                    marginLeft: 16,
                                    marginBottom: 8,
                                },
                                // Line
                                {
                                    width: "40%",
                                    height: 18,
                                    marginLeft: 16,
                                },
                                // Short line
                                {
                                    marginTop: 6,
                                    width: "30%",
                                    height: 14,
                                    marginLeft: 16,
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
