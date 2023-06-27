import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { usePlatformBottomInsets, useThemedStyles } from "~Hooks"
import { BackButtonHeader, BaseSpacer, BaseText, BaseView } from "~Components"
import { selectBlackListedCollections, useAppSelector } from "~Storage/Redux"
import { NFTView } from "../Components"
import { ScrollView } from "react-native-gesture-handler"
import { isEmpty } from "lodash"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { useI18nContext } from "~i18n"

type NFTListProps = {
    item: NonFungibleTokenCollection | NonFungibleToken
    index: number
}

export const BlackListedCollectionsScreen = () => {
    const { calculateBottomInsets } = usePlatformBottomInsets()

    const { LL } = useI18nContext()

    const blackListedCollections = useAppSelector(selectBlackListedCollections)

    const { styles } = useThemedStyles(baseStyles(calculateBottomInsets))

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderNftCollection = useCallback(({ item, index }: NFTListProps) => {
        return <NFTView item={item} index={index} isCollection isHidden />
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
                                styles.collectionlistContainer
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

const baseStyles = (calculateBottomInsets: number) => () =>
    StyleSheet.create({
        collectionlistContainer: {
            marginHorizontal: 20,
            paddingVertical: 24,
        },
        activityIndicator: {
            marginVertical: 36,
            transform: [{ scale: 1.2 }],
        },
        nftListContainer: {
            paddingBottom: calculateBottomInsets,
            marginHorizontal: 20,
            paddingVertical: 24,
        },
    })
