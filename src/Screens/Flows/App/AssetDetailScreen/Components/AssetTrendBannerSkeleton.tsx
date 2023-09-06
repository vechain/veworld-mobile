import React from "react"
import { useTheme } from "~Hooks"
import { BaseSkeleton } from "~Components/Base"

export const AssetTrendBannerSkeleton = () => {
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
                    children: [{ width: 102, height: 24 }],
                },
            ]}
        />
    )
}
