import { useNavigation } from "@react-navigation/native"
import React, { ComponentProps, Ref, useCallback } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSpacer } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import { CollectionCard } from "./CollectionCard"
import { SkeletonCollectionCard } from "./SkeletonCollectionCard"

type Props = {
    isLoading?: boolean
    scrollRef?: Ref<FlatList<string>>
    nested?: boolean
} & Omit<ComponentProps<typeof Animated.FlatList<string>>, "renderItem" | "ref">

export const CollectionsList = ({ data, scrollRef, isLoading, nested, style, ...props }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<string>) => {
            return (
                <CollectionCard
                    collectionAddress={item}
                    onPress={() => {
                        nav.navigate(Routes.COLLECTIBLES_COLLECTION_DETAILS, {
                            collectionAddress: item,
                        })
                    }}
                    onToggleFavorite={isFavorite => {
                        //Scroll to the top if the item is now favorite
                        if (isFavorite) {
                            if (typeof scrollRef !== "object") return
                            scrollRef?.current?.scrollToIndex({ animated: true, index: 0 })
                        }
                    }}
                />
            )
        },
        [nav, scrollRef],
    )

    const renderItemSkeleton = useCallback(() => {
        return <SkeletonCollectionCard />
    }, [])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={8} />
    }, [])
    if (isLoading)
        return (
            <FlatList
                keyExtractor={item => item}
                data={[1, 2, 3, 4, 5].map(item => item.toString())}
                renderItem={renderItemSkeleton}
                ItemSeparatorComponent={renderItemSeparator}
                contentContainerStyle={styles.listContentContainer}
                showsVerticalScrollIndicator={false}
                style={!nested && styles.list}
            />
        )
    return (
        <Animated.FlatList
            ref={scrollRef}
            keyExtractor={item => item}
            data={data}
            renderItem={renderItem}
            ItemSeparatorComponent={renderItemSeparator}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
            style={[!nested && styles.list, style]}
            {...props}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        list: {
            paddingHorizontal: 16,
        },
        listContentContainer: {
            paddingTop: 16,
            paddingBottom: 24,
        },
        skeletonRoot: {
            width: "100%",
            height: 182,
            position: "relative",
            overflow: "hidden",
            justifyContent: "flex-end",
        },
    })
