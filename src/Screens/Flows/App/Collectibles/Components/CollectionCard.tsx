import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import Animated from "react-native-reanimated"
import { Pressable, StyleSheet } from "react-native"
import { ImageStyle } from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseText, BaseView, BlurView, NFTImageComponent } from "~Components"
import { COLORS } from "~Constants"
import { useCollectionBookmarking, useThemedStyles } from "~Hooks"
import { useFavoriteAnimation } from "~Hooks/useFavoriteAnimation"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { URIUtils } from "~Utils"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { useCollectionMetadata } from "../Hooks/useCollectionMetadata"

type Props = {
    collectionAddress: string
    name?: string
    image?: string
    count?: number
    isObservedAccount?: boolean
    onPress?: (address: string) => void
}

const AnimatedBaseIcon = Animated.createAnimatedComponent(wrapFunctionComponent(BaseIcon))

export const CollectionCard: React.FC<Props> = ({
    collectionAddress,
    name: propName,
    image: propImage,
    count: propCount,
    isObservedAccount = false,
    onPress,
}) => {
    const { styles } = useThemedStyles(cardStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { isFavorite, toggleFavorite } = useCollectionBookmarking(collectionAddress)
    const { animatedStyles, favoriteIconAnimation } = useFavoriteAnimation()

    const { data: collectionMetadata, isLoading } = useCollectionMetadata(collectionAddress)

    const name = propName ?? collectionMetadata?.name ?? collectionAddress
    const count = propCount ?? collectionMetadata?.balanceOf ?? 0
    const imageSource = propImage ?? collectionMetadata?.image

    const imageUri = useMemo(() => {
        if (!imageSource) return undefined
        try {
            return URIUtils.convertUriToUrl(imageSource)
        } catch {
            return undefined
        }
    }, [imageSource])

    const handlePress = useCallback(() => {
        if (onPress) {
            onPress(collectionAddress)
        } else {
            nav.navigate(Routes.COLLECTIBLES_COLLECTION_DETAILS, { collectionAddress })
        }
    }, [collectionAddress, nav, onPress])

    const handleToggleFavorite = useCallback(() => {
        if (isObservedAccount) return
        HapticsService.triggerImpact({ level: "Light" })
        favoriteIconAnimation(finished => {
            if (finished) {
                toggleFavorite()
            }
        })
    }, [isObservedAccount, toggleFavorite, favoriteIconAnimation])

    return (
        <Pressable
            disabled={isLoading}
            onPress={handlePress}
            style={styles.root}
            testID={`collection-card-${collectionAddress}`}>
            {!isObservedAccount && (
                <Pressable
                    style={styles.favoriteIconContainer}
                    onPress={handleToggleFavorite}
                    testID={`collection-favorite-${collectionAddress}`}>
                    <AnimatedBaseIcon
                        name={isFavorite ? "icon-star-on" : "icon-star"}
                        size={16}
                        color={COLORS.WHITE}
                        style={animatedStyles}
                    />
                </Pressable>
            )}
            {imageUri ? (
                <NFTImageComponent style={styles.image as ImageStyle} uri={imageUri} />
            ) : (
                <BaseView style={styles.image} />
            )}

            <BlurView style={styles.bottom} overlayColor="transparent" blurAmount={10}>
                <LinearGradient
                    colors={[COLORS.BALANCE_BACKGROUND_GRADIENT_END_50, COLORS.BALANCE_BACKGROUND_50]}
                    useAngle
                    angle={0}>
                    <BaseView flexDirection="column" alignItems="flex-start" p={8}>
                        <BaseText
                            typographyFont="captionSemiBold"
                            color={COLORS.WHITE_RGBA_90}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {name}
                        </BaseText>
                        <BaseText typographyFont="captionRegular" color={COLORS.WHITE_RGBA_85} mt={2}>
                            {count} {LL.TAB_TITLE_NFT()}
                        </BaseText>
                    </BaseView>
                </LinearGradient>
            </BlurView>
        </Pressable>
    )
}

const cardStyles = () =>
    StyleSheet.create({
        root: {
            borderRadius: 12,
            position: "relative",
            flex: 1,
            overflow: "hidden",
            aspectRatio: 0.8791,
            maxWidth: "50%",
            backgroundColor: COLORS.BALANCE_BACKGROUND,
        },
        image: {
            height: "100%",
            width: "100%",
        },
        bottom: { position: "absolute", bottom: 0, left: 0, width: "100%" },
        favoriteIconContainer: {
            top: 8,
            right: 12,
            position: "absolute",
            zIndex: 1,
        },
    })
