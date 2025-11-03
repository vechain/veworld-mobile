import React from "react"
import { StyleSheet } from "react-native"
import { BaseSkeleton, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const CollectibleCardSkeleton = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <BaseView testID="VBD_COLLECTIBLE_CARD_SKELETON" style={styles.skeletonRoot}>
            <BaseSkeleton
                animationDirection="horizontalLeft"
                boneColor={theme.isDark ? COLORS.LIGHT_PURPLE : COLORS.GREY_200}
                highlightColor={theme.isDark ? COLORS.PURPLE : COLORS.GREY_300}
                rootStyle={[StyleSheet.absoluteFill]}
                borderRadius={12}
                height={257}
            />
            <BaseView p={8} flexDirection="column" gap={8}>
                <BaseSkeleton
                    animationDirection="horizontalLeft"
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                    height={10}
                    width={100}
                    borderRadius={2}
                />
            </BaseView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        skeletonRoot: {
            maxWidth: "50%",
            height: "100%",
            aspectRatio: 0.8791,
            overflow: "hidden",
            flex: 1,
            borderRadius: 12,
            position: "relative",
            justifyContent: "flex-end",
        },
    })
