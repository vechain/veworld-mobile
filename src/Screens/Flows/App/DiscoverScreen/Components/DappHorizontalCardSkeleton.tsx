import React from "react"
import { StyleSheet } from "react-native"
import { BaseSkeleton } from "~Components"
import { useTheme } from "~Hooks"

export const DappHorizontalCardSkeleton = () => {
    const theme = useTheme()
    return (
        <BaseSkeleton
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            containerStyle={styles.container}
            layout={[
                {
                    children: [{ width: 48, height: 48, borderRadius: 4 }],
                },
                {
                    flexDirection: "column",
                    gap: 8,
                    flex: 1,
                    children: [
                        { height: 16, width: 176 },
                        { height: 8, width: "100%" },
                    ],
                },
            ]}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 16,
        alignItems: "center",
        flex: 1,
    },
})
