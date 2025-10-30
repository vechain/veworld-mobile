import React from "react"
import { StyleSheet } from "react-native"
import { BaseSkeleton, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const SkeletonCollectionCard = () => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.skeletonRoot} testID="VBD_CAROUSEL_ITEM_SKELETON" borderRadius={12}>
            <BaseSkeleton
                animationDirection="horizontalLeft"
                boneColor={theme.isDark ? COLORS.LIGHT_PURPLE : COLORS.GREY_200}
                highlightColor={theme.isDark ? COLORS.PURPLE : COLORS.GREY_300}
                rootStyle={[StyleSheet.absoluteFill]}
                borderRadius={12}
                height={257}
            />
            <BaseView px={16} py={12} flexDirection="column" gap={8}>
                <BaseView flexDirection="row" justifyContent="space-between" w={100}>
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={20}
                        width={150}
                        borderRadius={4}
                    />
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={24}
                        width={30}
                        borderRadius={99}
                    />
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        skeletonRoot: {
            flex: 1,
            aspectRatio: 0.8791,
            position: "relative",
            overflow: "hidden",
            justifyContent: "flex-end",
            maxWidth: "50%",
        },
    })
