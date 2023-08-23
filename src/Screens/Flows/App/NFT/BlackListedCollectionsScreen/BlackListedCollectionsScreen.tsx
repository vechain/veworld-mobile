import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { useTabBarBottomMargin, useThemedStyles } from "~Hooks"
import { BackButtonHeader, BaseSpacer, BaseText, BaseView } from "~Components"
import { selectBlackListedCollections, useAppSelector } from "~Storage/Redux"
import { NFTCollectionView } from "../NFTCollectionView"
import { ScrollView } from "react-native-gesture-handler"
import { isEmpty } from "lodash"
import { NftCollection } from "~Model"
import { useI18nContext } from "~i18n"

type NFTListProps = {
    item: NftCollection
    index: number
}

export const BlackListedCollectionsScreen = () => {
    const { iosOnlyTabBarBottomMargin } = useTabBarBottomMargin()

    const { LL } = useI18nContext()

    const blackListedCollections = useAppSelector(selectBlackListedCollections)

    const { styles } = useThemedStyles(baseStyles(iosOnlyTabBarBottomMargin))

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderNftCollection = useCallback(({ item, index }: NFTListProps) => {
        return <NFTCollectionView collection={item} index={index} />
    }, [])

    return (
        <>
            <BaseSpacer height={16} />
            <BackButtonHeader hasBottomSpacer={false} />
            <BaseSpacer height={8} />

            <ScrollView>
                <BaseView mx={20}>
                    <BaseText my={8} typographyFont="button">
                        {LL.MANAGE_NFTS()}
                    </BaseText>
                    <BaseText>{LL.RESTORE_NFTS()}</BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="title">
                        {LL.COLLECTIONS()}
                    </BaseText>
                </BaseView>

                <BaseView justifyContent="center">
                    {!isEmpty(blackListedCollections) ? (
                        <FlatList
                            scrollEnabled={false}
                            data={blackListedCollections}
                            extraData={blackListedCollections}
                            contentContainerStyle={
                                styles.collectionListContainer
                            }
                            numColumns={2}
                            keyExtractor={item => String(item.address)}
                            ItemSeparatorComponent={renderSeparator}
                            renderItem={renderNftCollection}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                        />
                    ) : (
                        <>
                            <BaseView
                                justifyContent="center"
                                alignItems="center"
                                py={48}>
                                <BaseText typographyFont="caption">
                                    {LL.NO_HIDDEN_COLLECTIONS({
                                        name: "Collections",
                                    })}
                                </BaseText>
                            </BaseView>
                        </>
                    )}
                </BaseView>
            </ScrollView>
        </>
    )
}

const baseStyles = (iosOnlyTabBarBottomMargin: number) => () =>
    StyleSheet.create({
        collectionListContainer: {
            marginHorizontal: 20,
            paddingVertical: 24,
        },
        activityIndicator: {
            marginVertical: 36,
            transform: [{ scale: 1.2 }],
        },
        nftListContainer: {
            paddingBottom: iosOnlyTabBarBottomMargin,
            marginHorizontal: 20,
            paddingVertical: 24,
        },
    })
