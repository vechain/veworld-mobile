import React from "react"
import { useTheme } from "~Hooks"
import { BaseSkeleton } from "~Components/Base"

export const AssetPriceBannerSkeleton = ({ symbol }: { symbol: string }) => {
    const theme = useTheme()

    return (
        <BaseSkeleton
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[
                {
                    alignItems: "center",
                    opacity: 0.3,
                    children: [
                        {
                            width: symbol === "VET" ? 148 : 162,
                            height: symbol === "VET" ? 38 : 24,
                        },
                    ],
                },
            ]}
        />
    )
}
