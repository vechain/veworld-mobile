import React, { useCallback, useMemo, useState } from "react"
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { ImageStyle } from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import { BaseText, BaseView, BaseSpacer, BlurView, NFTImageComponent } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useNFTRegistry } from "~Hooks/useNft/useNFTRegistry"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectAllFavoriteCollections, useAppSelector } from "~Storage/Redux"
import { URIUtils } from "~Utils"
import { CollectiblesEmptyCard } from "../BalanceScreen/Components/Collectibles/CollectiblesEmptyCard"
import { useFetchCollections } from "../NFT/NFTScreen/useFetchCollections"

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

const CollectionCard: React.FC<{ address: string; name?: string; image?: string; count?: number }> = ({
    address,
    name,
    image,
    count,
}) => {
    const { styles } = useThemedStyles(cardStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const handlePress = useCallback(() => {
        nav.navigate(Routes.COLLECTIBLES_COLLECTION_DETAILS, {
            collectionAddress: address,
        })
    }, [address, nav])

    const imageUri = useMemo(() => {
        if (!image) return undefined
        try {
            return URIUtils.convertUriToUrl(image)
        } catch {
            return undefined
        }
    }, [image])

    return (
        <Pressable style={styles.root} onPress={handlePress}>
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
                            {name || address}
                        </BaseText>
                        <BaseText typographyFont="captionRegular" color={COLORS.WHITE_RGBA_85} mt={2}>
                            {count || 0} {LL.TAB_TITLE_NFT()}
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
    })

export const CollectionsListScreen: React.FC = () => {
    const { styles } = useThemedStyles(baseStyles)
    useNFTRegistry()
    const favoriteCollections = useAppSelector(selectAllFavoriteCollections)

    const [onEndReachedCalledDuringMomentum, setEndReachedCalledDuringMomentum] = useState(true)

    const { fetchMoreCollections, collections } = useFetchCollections(
        onEndReachedCalledDuringMomentum,
        setEndReachedCalledDuringMomentum,
    )

    const favoriteAddresses = useMemo(() => {
        return new Set(favoriteCollections.map(fav => fav.address.toLowerCase()))
    }, [favoriteCollections])

    const sortedCollections = useMemo(() => {
        // Sort collections: favorites first, then by original order
        return [...collections].sort((a, b) => {
            const aIsFavorite = favoriteAddresses.has(a.address.toLowerCase())
            const bIsFavorite = favoriteAddresses.has(b.address.toLowerCase())

            if (aIsFavorite && !bIsFavorite) return -1
            if (!aIsFavorite && bIsFavorite) return 1
            return 0
        })
    }, [collections, favoriteAddresses])

    const onMomentumScrollBegin = useCallback(() => {
        setEndReachedCalledDuringMomentum(true)
    }, [])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<{ address: string; name?: string; image?: string; balanceOf?: number }>) => {
            return <CollectionCard address={item.address} name={item.name} image={item.image} count={item.balanceOf} />
        },
        [],
    )

    return (
        <FlatList
            renderItem={renderItem}
            data={sortedCollections}
            numColumns={2}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListEmptyComponent={CollectiblesEmptyCard}
            keyExtractor={v => v.address}
            columnWrapperStyle={styles.listColumn}
            onEndReached={fetchMoreCollections}
            onEndReachedThreshold={0.5}
            onMomentumScrollBegin={onMomentumScrollBegin}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listColumn: {
            columnGap: 8,
        },
    })
