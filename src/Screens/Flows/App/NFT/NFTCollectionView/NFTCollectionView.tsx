import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { BaseText, BaseView, LongPressProvider, NFTMedia, PlatformBlur } from "~Components"
import { NftCollection } from "~Model"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { useToggleCollection } from "../NFTCollectionDetailScreen/Components/Hooks/useToggleCollection"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { PlatformUtils } from "~Utils"

type Props = {
    collection: NftCollection
    index: number
}

export const NFTCollectionView = ({ collection, index }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const { onToggleCollection, isBlacklisted } = useToggleCollection(collection)

    const CollectionItem = useMemo(
        () => [
            {
                title: isBlacklisted ? LL.SHOW_COLLECTION() : LL.HIDE_COLLECTION(),

                subtitle: isBlacklisted ? LL.SHOW_COLLECTION_SUBTITLE() : LL.HIDE_COLLECTION_SUBTITLE(),

                systemIcon: "circle.slash", // iOS system icon name
                destructive: true,
            },
        ],
        [isBlacklisted, LL],
    )

    const onCollectionPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        nav.navigate(Routes.NFT_COLLECTION_DETAILS, {
            collectionAddress: collection.address,
        })
    }, [nav, collection.address])

    const renderCollection = useMemo(() => {
        return (
            <BaseView style={styles.nftCollectionNameBarRadius}>
                <NFTMedia uri={collection.image} styles={styles.nftPreviewImage} />
                {isBlacklisted ? (
                    <PlatformBlur
                        backgroundColor={theme.colors.card}
                        blurAmount={10}
                        text={LL.SHOW_COLLECTION()}
                        paddingBottom={22}
                    />
                ) : null}

                <BaseView
                    style={styles.nftCollectionNameBar}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between">
                    <BaseText color={COLORS.WHITE} numberOfLines={1} w={80}>
                        {collection.name}
                    </BaseText>
                    {collection.balanceOf && collection.balanceOf > 0 && (
                        <BaseView style={styles.nftCounterLabel} justifyContent="center" alignItems="center">
                            <BaseText color={COLORS.WHITE}>{collection.balanceOf}</BaseText>
                        </BaseView>
                    )}
                </BaseView>
            </BaseView>
        )
    }, [
        styles.nftCollectionNameBarRadius,
        styles.nftPreviewImage,
        styles.nftCollectionNameBar,
        styles.nftCounterLabel,
        collection.image,
        collection.name,
        collection.balanceOf,
        isBlacklisted,
        theme.colors.card,
        LL,
    ])

    return (
        <BaseView
            style={[
                styles.nftContainer,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                },
            ]}>
            <LongPressProvider items={CollectionItem} action={onToggleCollection}>
                <TouchableOpacity
                    activeOpacity={PlatformUtils.isIOS() ? 0.6 : 1}
                    // Workaround -> https://github.com/mpiannucci/react-native-context-menu-view/issues/60#issuecomment-1453864955
                    onLongPress={() => {}}
                    onPress={collection.updated ? onCollectionPress : undefined}>
                    {renderCollection}
                </TouchableOpacity>
            </LongPressProvider>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        nftContainer: {
            flexWrap: "wrap",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "50%",
        },

        nftPreviewImage: {
            width: SCREEN_WIDTH / 2 - 30,
            height: 164,
            borderRadius: 13,
        },

        nftCollectionNameBar: {
            position: "absolute",
            height: 34,
            bottom: 0,
            left: 0,
            width: SCREEN_WIDTH / 2 - 30,
            backgroundColor: COLORS.DARK_PURPLE_RBGA,
            paddingHorizontal: 12,
        },
        nftCollectionNameBarRadius: {
            overflow: "hidden",
            borderRadius: 13,
        },
        nftCounterLabel: {
            minWidth: 20,
            height: 20,
            paddingHorizontal: 4,
            borderRadius: 13,
            backgroundColor: COLORS.DARK_PURPLE,
        },
    })
