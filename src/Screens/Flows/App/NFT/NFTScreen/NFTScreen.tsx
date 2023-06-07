import React, { useCallback } from "react"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { NftScreenHeader } from "./Components"
import { NonFungibleTokenCollection } from "~Model"
import { isEmpty } from "lodash"
import { NftSkeleton } from "./Components/NftSkeleton"
import { StyleSheet, FlatList, ActivityIndicator } from "react-native"
import { usePlatformBottomInsets, useThemedStyles } from "~Common"
import { NFTView } from "../Components"
import { useFetchCollections } from "./useFetchCollections"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

type NFTListProps = {
    item: NonFungibleTokenCollection
    index: number
}

export const NFTScreen = () => {
    const { calculateBottomInsets } = usePlatformBottomInsets()

    const nav = useNavigation()
    const { LL } = useI18nContext()

    const { fetchMoreCollections, isLoading, collections } =
        useFetchCollections()

    const { styles } = useThemedStyles(baseStyles(calculateBottomInsets))

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderNftCollection = useCallback(({ item, index }: NFTListProps) => {
        return <NFTView item={item} index={index} isCollection />
    }, [])

    const onGoToBlackListed = useCallback(
        () => nav.navigate(Routes.BLACKLISTED_COLLECTIONS),
        [nav],
    )

    const renderFooterComponent = useCallback(() => {
        if (isLoading) {
            return <ActivityIndicator style={styles.activityIndicator} />
        }

        return (
            <>
                <BaseSpacer height={18} />
                <BaseTouchableBox
                    action={onGoToBlackListed}
                    children={
                        <>
                            <BaseView
                                w={100}
                                h={100}
                                flexDirection="row"
                                justifyContent="center"
                                alignItems="center">
                                <BaseText typographyFont="bodyBold">
                                    {LL.HIDDEN_COLLECTIONS()}
                                </BaseText>
                                <BaseIcon name="chevron-down" />
                            </BaseView>
                        </>
                    }
                />
                <BaseSpacer height={18} />
            </>
        )
    }, [LL, isLoading, styles.activityIndicator, onGoToBlackListed])

    return (
        <BaseSafeArea grow={1} testID="NFT_Screen">
            <NftScreenHeader />

            <BaseView flex={1} justifyContent="center">
                {!isEmpty(collections) ? (
                    <FlatList
                        data={collections}
                        extraData={collections}
                        contentContainerStyle={styles.listContainer}
                        numColumns={2}
                        keyExtractor={item => String(item.address)}
                        ItemSeparatorComponent={renderSeparator}
                        renderItem={renderNftCollection}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        onEndReachedThreshold={1}
                        onEndReached={fetchMoreCollections}
                        ListFooterComponent={renderFooterComponent}
                    />
                ) : (
                    <NftSkeleton />
                )}
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = (calculateBottomInsets: number) => () =>
    StyleSheet.create({
        listContainer: {
            marginHorizontal: 20,
            paddingTop: 24,
            paddingBottom: calculateBottomInsets,
        },
        activityIndicator: {
            marginVertical: 36,
            transform: [{ scale: 1.2 }],
        },
    })
