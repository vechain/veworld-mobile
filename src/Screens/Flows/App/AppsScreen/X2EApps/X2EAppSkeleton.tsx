import React from "react"
import { BaseSkeleton } from "~Components"
import { useTheme } from "~Hooks"

export const X2EAppSkeleton = React.memo(() => {
    const theme = useTheme()

    return (
        <BaseSkeleton
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[
                {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 24,
                    children: [
                        { width: 64, height: 64, borderRadius: 8 },
                        {
                            flexDirection: "column",
                            gap: 8,
                            flex: 1,
                            children: [
                                { width: "70%", height: 17, borderRadius: 4 },
                                { width: "90%", height: 14, borderRadius: 4 },
                            ],
                        },
                    ],
                },
            ]}
        />
    )
})
