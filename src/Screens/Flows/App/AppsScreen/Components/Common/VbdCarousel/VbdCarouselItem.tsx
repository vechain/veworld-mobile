import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { BaseSpacer, BaseText, BaseView, BlurView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { URIUtils } from "~Utils"
import { AVAILABLE_CATEGORIES, CategoryChip } from "../CategoryChip"

type Props = {
    app: VeBetterDaoDapp & VeBetterDaoDAppMetadata
}

export const VbdCarouselItem = ({ app }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    const bannerUri = useMemo(
        () => (app.ve_world?.banner ? URIUtils.convertUriToUrl(app.ve_world?.banner as string) : undefined),
        [app],
    )
    const iconUri = useMemo(() => URIUtils.convertUriToUrl(app.logo), [app])

    const category = useMemo(() => {
        return app.categories?.find(cat => AVAILABLE_CATEGORIES.includes(cat as any)) as
            | (typeof AVAILABLE_CATEGORIES)[number]
            | undefined
    }, [app.categories])

    return (
        <BaseView style={styles.root}>
            <FastImage source={{ uri: bannerUri }} style={StyleSheet.absoluteFill} />
            <BlurView style={styles.blurView} overlayColor="transparent" blurAmount={10}>
                <BaseView px={16} py={12} flexDirection="column" gap={8}>
                    <BaseView flexDirection="row">
                        <FastImage source={{ uri: iconUri }} style={styles.logo as ImageStyle} />
                        <BaseSpacer width={12} flexShrink={0} />
                        <BaseText
                            flex={1}
                            numberOfLines={1}
                            typographyFont="subSubTitleSemiBold"
                            color={COLORS.GREY_50}>
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
                        flexDirection="row">
                        {app.description}
                    </BaseText>
                </BaseView>
            </BlurView>
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
        blurView: {
            // backgroundColor: "rgba(0, 0, 0, 0.30)",
            backgroundColor: "rgba(0, 0, 0, 0.30)",
        },
        logo: {
            width: 24,
            height: 24,
            borderRadius: 4,
        },
    })
