import React, { useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { BaseSpacer, BaseText, BaseView, BlurView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { VbdDApp } from "~Model"
import { URIUtils } from "~Utils"
import { AVAILABLE_CATEGORIES, CategoryChip } from "../CategoryChip"
import { VbdCarouselBottomSheet } from "./VbdCarouselBottomSheet"

type VbdCarouselItemProps = {
    app: VbdDApp
}

export const VbdCarouselItem = ({ app }: VbdCarouselItemProps) => {
    const { styles } = useThemedStyles(baseStyles)

    const bannerUri = useMemo(
        () => (app.ve_world?.banner ? URIUtils.convertUriToUrl(app.ve_world?.banner as string) : undefined),
        [app],
    )
    const iconUri = useMemo(() => (app.logo ? URIUtils.convertUriToUrl(app.logo) : undefined), [app])

    const category = useMemo(() => {
        return app.categories?.find(cat => AVAILABLE_CATEGORIES.includes(cat as any)) as
            | (typeof AVAILABLE_CATEGORIES)[number]
            | undefined
    }, [app.categories])

    const [isOpen, setIsOpen] = useState(false)

    const onPress = useCallback(() => {
        setIsOpen(true)
    }, [])

    return (
        <>
            <Pressable onPress={onPress}>
                <BaseView style={styles.root} testID="VBD_CAROUSEL_ITEM">
                    <FastImage source={{ uri: bannerUri }} style={StyleSheet.absoluteFill} />
                    <BlurView style={styles.blurView} overlayColor="transparent" blurAmount={10}>
                        <BaseView px={16} py={12} flexDirection="column" gap={8}>
                            <BaseView flexDirection="row" alignItems="center" justifyContent="space-between">
                                <BaseView flexDirection="row" alignItems="center">
                                    <FastImage source={{ uri: iconUri }} style={styles.logo as ImageStyle} />
                                    <BaseSpacer width={12} flexShrink={0} />
                                    <BaseText
                                        numberOfLines={1}
                                        typographyFont="subSubTitleSemiBold"
                                        color={COLORS.GREY_50}
                                        testID="VBD_CAROUSEL_ITEM_APP_NAME">
                                        {app.name}
                                    </BaseText>
                                </BaseView>
                                <BaseView flexDirection="row">
                                    {category && (
                                        <BaseView flexDirection="row" alignItems="center">
                                            <BaseSpacer width={24} flexShrink={0} />
                                            <CategoryChip category={category} />
                                        </BaseView>
                                    )}
                                </BaseView>
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
                </BaseView>
            </Pressable>

            <VbdCarouselBottomSheet
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                bannerUri={bannerUri}
                iconUri={iconUri}
                app={app}
                category={category}
            />
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            height: "100%",
            borderRadius: 24,
            position: "relative",
            overflow: "hidden",
            justifyContent: "flex-end",
        },
        blurView: {
            backgroundColor: "rgba(0, 0, 0, 0.30)",
        },
        logo: {
            width: 24,
            height: 24,
            borderRadius: 4,
        },
    })
