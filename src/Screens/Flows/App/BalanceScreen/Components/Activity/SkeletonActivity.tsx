import React from "react"
import { StyleSheet } from "react-native"
import { BaseSkeleton } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const SkeletonActivity = () => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseSkeleton
            containerStyle={styles.container}
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[
                {
                    width: 32,
                    height: 32,
                    marginRight: 16,
                },
                {
                    flexDirection: "column",
                    gap: 2,
                    flex: 1,
                    marginRight: 8,
                    children: [
                        {
                            width: "30%",
                            //Line height of the timestamp
                            height: 14,
                        },
                        {
                            width: "50%",
                            //Line height of the title
                            height: 16,
                        },
                        {
                            width: "70%",
                            //Line height of the subtitle
                            height: 16,
                        },
                    ],
                },
                {
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 2,
                    children: [
                        {
                            width: 50,
                            height: 14,
                        },
                        {
                            width: 32,
                            height: 14,
                        },
                    ],
                },
            ]}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            flexDirection: "row",
            height: 74,
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
        },
    })
