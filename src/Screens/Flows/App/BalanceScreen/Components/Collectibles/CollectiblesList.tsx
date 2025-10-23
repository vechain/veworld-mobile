import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet } from "react-native"
import { ImageStyle } from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, BlurView, NFTImageComponent } from "~Components"
import { COLORS } from "~Constants"
import { useCollectionBookmarking, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useNFTCollections } from "~Screens/Flows/App/Collectibles/Hooks"
import { useCollectionMetadata } from "~Screens/Flows/App/Collectibles/Hooks/useCollectionMetadata"
import HapticsService from "~Services/HapticsService"
import { selectAllFavoriteCollections, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils, URIUtils } from "~Utils"
import { CollectiblesEmptyCard } from "./CollectiblesEmptyCard"

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

const CollectionCard: React.FC<{ collectionAddress: string; isObservedAccount: boolean }> = ({
    collectionAddress,
    isObservedAccount,
}) => {
    const { styles } = useThemedStyles(cardStyles)
    const { isFavorite, toggleFavorite } = useCollectionBookmarking(collectionAddress)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { data: collectionMetadata } = useCollectionMetadata(collectionAddress)

    const handlePress = useCallback(() => {
        nav.navigate(Routes.COLLECTIBLES_COLLECTION_DETAILS, {
            collectionAddress,
        })
    }, [collectionAddress, nav])

    const imageUri = useMemo(() => {
        if (!collectionMetadata?.image) return undefined
        try {
            return URIUtils.convertUriToUrl(collectionMetadata.image)
        } catch {
            return undefined
        }
    }, [collectionMetadata?.image])

    const handleToggleFavorite = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        toggleFavorite()
    }, [toggleFavorite])

    return (
        <Pressable style={styles.root} onPress={handlePress}>
            {!isObservedAccount && (
                <Pressable onPress={handleToggleFavorite} style={styles.favoriteIconContainer} hitSlop={16}>
                    <BaseIcon name={isFavorite ? "icon-star-on" : "icon-star"} color={COLORS.WHITE} />
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
                            {collectionMetadata?.name || collectionAddress}
                        </BaseText>
                        <BaseText typographyFont="captionRegular" color={COLORS.WHITE_RGBA_85} mt={2}>
                            {collectionMetadata?.balanceOf || 0} {LL.TAB_TITLE_NFT()}
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

const ListFooterComponent = ({ hasCollections }: { hasCollections: boolean }) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(footerStyles)

    const onNavigate = useCallback(() => {
        nav.navigate(Routes.COLLECTIBLES_COLLECTIONS)
    }, [nav])

    if (!hasCollections) return null

    return (
        <BaseButton
            variant="ghost"
            px={0}
            py={4}
            action={onNavigate}
            typographyFont="bodyMedium"
            style={styles.btn}
            textColor={theme.colors.text}
            rightIcon={<BaseIcon name="icon-arrow-right" size={14} style={styles.icon} color={theme.colors.text} />}>
            {LL.ACTIVITY_SEE_ALL()}
        </BaseButton>
    )
}

const footerStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 2,
        },
        btn: {
            marginTop: 16,
        },
    })

export const CollectiblesList = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { data: paginatedCollections } = useNFTCollections()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const favoriteCollections = useAppSelector(selectAllFavoriteCollections)

    const isObservedAccount = useMemo(() => {
        return AccountUtils.isObservedAccount(selectedAccount)
    }, [selectedAccount])

    const favoriteAddresses = useMemo(() => {
        return new Set(favoriteCollections.map(fav => fav.address.toLowerCase()))
    }, [favoriteCollections])

    const collections = useMemo(() => {
        const allCollections = paginatedCollections?.pages.flatMap(page => page.collections) ?? []

        // Sort collections: favorites first, then by original order
        return allCollections.sort((a, b) => {
            const aIsFavorite = favoriteAddresses.has(a.toLowerCase())
            const bIsFavorite = favoriteAddresses.has(b.toLowerCase())

            if (aIsFavorite && !bIsFavorite) return -1
            if (!aIsFavorite && bIsFavorite) return 1
            return 0
        })
    }, [paginatedCollections, favoriteAddresses])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<string>) => {
            return <CollectionCard collectionAddress={item} isObservedAccount={isObservedAccount} />
        },
        [isObservedAccount],
    )

    return (
        <FlatList
            renderItem={renderItem}
            data={collections}
            numColumns={2}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListEmptyComponent={CollectiblesEmptyCard}
            horizontal={false}
            keyExtractor={v => v}
            columnWrapperStyle={styles.listColumn}
            ListFooterComponent={<ListFooterComponent hasCollections={collections.length > 0} />}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listColumn: {
            columnGap: 8,
        },
    })
