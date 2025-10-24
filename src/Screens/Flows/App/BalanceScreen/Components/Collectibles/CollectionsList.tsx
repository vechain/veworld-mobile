import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useNFTCollections } from "~Screens/Flows/App/Collectibles/Hooks"
import { CollectionCard } from "~Screens/Flows/App/Collectibles/Components/CollectionCard"
import { selectAllFavoriteCollections, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { CollectiblesEmptyCard } from "./CollectiblesEmptyCard"

const MAX_COLLECTIONS_PREVIEW = 4
const ItemSeparatorComponent = () => <BaseSpacer height={8} />

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

export const CollectionsList = () => {
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

        const sorted = [...allCollections].sort((a, b) => {
            const aIsFavorite = favoriteAddresses.has(a.toLowerCase())
            const bIsFavorite = favoriteAddresses.has(b.toLowerCase())

            if (aIsFavorite && !bIsFavorite) return -1
            if (!aIsFavorite && bIsFavorite) return 1
            return 0
        })

        return sorted.slice(0, MAX_COLLECTIONS_PREVIEW)
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
