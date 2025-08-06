import React from "react"
import { StyleSheet } from "react-native"
import { BaseSkeleton, BaseSpacer, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const VbdCarouselItemSkeleton = () => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.root}>
            <BaseSkeleton
                animationDirection="horizontalLeft"
                boneColor={theme.isDark ? COLORS.LIGHT_PURPLE : COLORS.GREY_200}
                highlightColor={theme.isDark ? COLORS.PURPLE : COLORS.GREY_300}
                rootStyle={[StyleSheet.absoluteFill]}
                height={257}
            />
            <BaseView px={16} py={12} flexDirection="column" gap={8}>
                <BaseView flexDirection="row" w={100}>
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={24}
                        width={24}
                        borderRadius={4}
                    />
                    <BaseSpacer width={12} flexShrink={0} />
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={20}
                        width={100}
                        borderRadius={4}
                    />
                </BaseView>
                <BaseView flexDirection="column" gap={4} w={100}>
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={10}
                        width={"100%"}
                    />
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={10}
                        width={"50%"}
                    />
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            height: "100%",
            borderRadius: 16,
            position: "relative",
            overflow: "hidden",
            justifyContent: "flex-end",
        },
        logo: {
            width: 24,
            height: 24,
            borderRadius: 4,
        },
    })
