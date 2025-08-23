import React, { useMemo } from "react"
import { ImageStyle, Pressable, StyleSheet } from "react-native"
import FastImage, { ImageStyle as FastImageStyle } from "react-native-fast-image"
import Animated, { SharedTransition, withTiming } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseView, BlurView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { VbdDApp } from "~Model"
import { URIUtils } from "~Utils"
import { AVAILABLE_CATEGORIES, CategoryChip } from "../CategoryChip"
import { VbdCarouselBottomSheetMetadata } from "./VbdCarouselBottomSheet"

type VbdCarouselItemProps = {
    app: VbdDApp
    onPressItem: (props: VbdCarouselBottomSheetMetadata) => void
}

export const VbdCarouselItem = ({ app, onPressItem }: VbdCarouselItemProps) => {
    const { styles } = useThemedStyles(baseStyles)

    const bannerUri = useMemo(() => {
        const uri = app.ve_world?.featured_image ?? app.ve_world?.banner
        return uri ? URIUtils.convertUriToUrl(uri) : undefined
    }, [app])
    const iconUri = useMemo(() => (app.logo ? URIUtils.convertUriToUrl(app.logo) : undefined), [app])

    const category = useMemo(() => {
        return app.categories?.find(cat => AVAILABLE_CATEGORIES.includes(cat as any)) as
            | (typeof AVAILABLE_CATEGORIES)[number]
            | undefined
    }, [app.categories])

    const sharedTransitionStyle = SharedTransition.custom(values => {
        "worklet"
        return {
            width: values.targetWidth,
            height: withTiming(values.targetHeight),
            borderRadius: withTiming(24),
        }
    })

    return (
        <Pressable onPress={() => onPressItem({ bannerUri, iconUri, app, category })}>
            <Animated.View
                style={styles.imageWrapper}
                sharedTransitionStyle={sharedTransitionStyle}
                testID="VBD_CAROUSEL_ITEM">
                <Animated.Image
                    sharedTransitionTag={`PREVIEW_IMAGE_${app.id}`}
                    source={{ uri: bannerUri }}
                    style={[StyleSheet.absoluteFill, styles.root as ImageStyle]}
                />
                <BlurView style={styles.blurView} overlayColor="transparent" blurAmount={10}>
                    <BaseView px={16} py={12} flexDirection="column" gap={8}>
                        <BaseView flexDirection="row">
                            <FastImage source={{ uri: iconUri }} style={styles.logo as FastImageStyle} />
                            <BaseSpacer width={12} flexShrink={0} />
                            <BaseText
                                flex={1}
                                numberOfLines={1}
                                typographyFont="subSubTitleSemiBold"
                                color={COLORS.GREY_50}
                                testID="VBD_CAROUSEL_ITEM_APP_NAME">
                                {app.name}
                            </BaseText>
                            {category && (
                                <>
                                    <BaseSpacer width={24} flexShrink={0} />
                                    <CategoryChip category={category} />
                                </>
                            )}
                        </BaseView>
                        <BaseText
                            typographyFont="captionMedium"
                            color={COLORS.WHITE_RGBA_85}
                            numberOfLines={2}
                            flexDirection="row"
                            testID="VBD_CAROUSEL_ITEM_APP_DESCRIPTION">
                            {app.description}
                        </BaseText>
                    </BaseView>
                </BlurView>
            </Animated.View>
        </Pressable>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            height: 257,
            borderRadius: 16,
            position: "relative",
            overflow: "hidden",
            justifyContent: "flex-end",
        },
        imageWrapper: {
            position: "relative",
            height: 257,
            width: "100%",
            borderRadius: 16,
            overflow: "hidden",
        },
        blurView: {
            backgroundColor: "rgba(0, 0, 0, 0.30)",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
        },
        logo: {
            width: 24,
            height: 24,
            borderRadius: 4,
        },
    })
