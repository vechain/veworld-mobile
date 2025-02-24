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
                {
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: 80,
                    height: 20,
                    marginBottom: 8,
                },
                {
                    flexDirection: "column",
                    width: "100%",
                    height: 72,
                    borderRadius: 12,
                    marginBottom: 8,
                },
                {
                    flexDirection: "column",
                    width: "100%",
                    height: 72,
                    borderRadius: 12,
                    marginBottom: 24,
                },
            ]}
        />
    )
}

const baseStyles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "column",
    },
})
