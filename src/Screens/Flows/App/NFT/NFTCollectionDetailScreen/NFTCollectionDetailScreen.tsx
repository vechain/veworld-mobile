import { FlatList, StyleSheet, TouchableOpacity } from "react-native"
import React, { useCallback, useMemo, useState } from "react"
import {
    selectCollectionWithContractAddres,
    useAppSelector,
} from "~Storage/Redux"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    BaseIcon,
    BaseImage,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useTheme } from "~Common"
import { useNavigation } from "@react-navigation/native"
import { useI18nContext } from "~i18n"
import { NonFungibleToken } from "~Model"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { PlatformUtils } from "~Utils"
import DropShadow from "react-native-drop-shadow"
import { isEmpty } from "lodash"

type Props = NativeStackScreenProps<
    RootStackParamListNFT,
    Routes.NFT_COLLECTION_DETAILS
>

export const NFTCollectionDetailScreen = ({ route }: Props) => {
    const nav = useNavigation()
    const theme = useTheme()
    const { LL } = useI18nContext()
    const insets = useSafeAreaInsets()
    const tabBarHeight = useBottomTabBarHeight()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const collection = useAppSelector(state =>
        selectCollectionWithContractAddres(
            state,
            route.params.collectionAddress,
        ),
    )

    // To prevent fetching next page of activities on FlashList mount
    const [hasScrolled, setHasScrolled] = useState(false)

    const onScroll = useCallback(() => {
        if (!hasScrolled) setHasScrolled(true)
    }, [hasScrolled])

    const contactsListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const remderHeaderComponent = useMemo(
        () => (
            <BaseView mx={20}>
                <BaseIcon
                    style={baseStyles.backIcon}
                    size={36}
                    name="chevron-left"
                    color={theme.colors.text}
                    action={goBack}
                />

                <BaseSpacer height={18} />

                <BaseView flexDirection="row" alignItems="flex-end">
                    <BaseImage
                        uri={collection?.icon ?? ""}
                        style={baseStyles.nftHeaderImage}
                    />

                    <BaseText typographyFont="biggerTitle">
                        {collection?.name}
                    </BaseText>
                </BaseView>

                <>
                    <BaseSpacer height={24} />
                    <BaseText mb={12}>{LL.SB_DESCRIPTION()}</BaseText>
                    <BaseText typographyFont="bodyBold">
                        {!isEmpty(collection?.description)
                            ? collection?.description
                            : LL.BD_NFT_DESC_PLACEHOLDER()}
                    </BaseText>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="biggerTitle">
                        {LL.SB_COLLECTIBLES()}
                    </BaseText>
                </>

                <BaseSpacer height={12} />
            </BaseView>
        ),
        [
            LL,
            collection?.description,
            collection?.icon,
            collection?.name,
            goBack,
            theme.colors.text,
        ],
    )

    const onNftPress = useCallback(
        (nft: NonFungibleToken) =>
            nav.navigate(Routes.NFT_DETAILS, { collectionData: {}, nft }),
        [nav],
    )

    const renderItem = useCallback(
        ({ item, index }: { item: NonFungibleToken; index: number }) => (
            <TouchableOpacity
                onPress={() => onNftPress(item)}
                style={[
                    baseStyles.nftContainer,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                        justifyContent:
                            index % 2 === 0 ? "flex-start" : "flex-end",
                    },
                ]}>
                <DropShadow style={theme.shadows.nftCard}>
                    <BaseImage
                        uri={item.image}
                        style={baseStyles.nftPreviewImage}
                    />
                </DropShadow>
            </TouchableOpacity>
        ),
        [onNftPress, theme.shadows.nftCard],
    )

    const calculateBottomPadding = useMemo(
        () => (PlatformUtils.isIOS() ? tabBarHeight - insets.bottom : 0),
        [insets.bottom, tabBarHeight],
    )

    if (!collection) return null

    return (
        <BaseSafeArea grow={1} testID="NFT_Collection_Detail_Screen">
            {remderHeaderComponent}

            <BaseView
                flex={1}
                mx={20}
                justifyContent="center"
                style={{
                    marginBottom: calculateBottomPadding,
                }}>
                <FlatList
                    data={collection?.nfts ?? []}
                    ItemSeparatorComponent={contactsListSeparator}
                    numColumns={2}
                    keyExtractor={(item: NonFungibleToken) =>
                        String(item?.tokenId)
                    }
                    extraData={collection?.nfts ?? []}
                    renderItem={renderItem}
                    contentContainerStyle={baseStyles.listContainer}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    onEndReachedThreshold={1}
                    // onEndReached={hasScrolled ? fetchActivities : undefined}
                />
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: -12,
        alignSelf: "flex-start",
    },
    listContainer: {
        paddingTop: 12,
    },
    nftContainer: {
        flexWrap: "wrap",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "50%",
    },
    nftHeaderImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    nftPreviewImage: {
        width: 164,
        height: 164,
        borderRadius: 16,
    },
})
