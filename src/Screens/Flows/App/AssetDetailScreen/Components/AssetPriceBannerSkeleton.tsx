import React from "react"
import { useTheme } from "~Hooks"
import { BaseSkeleton } from "~Components/Base"

export const AssetPriceBannerSkeleton = () => {
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
                    marginTop: 15,
                    marginBottom: 10,
                    children: [
                        {
                            width: 148,
                            height: 38,
                        },
                    ],
                },
            ]}
        />
    )
}
