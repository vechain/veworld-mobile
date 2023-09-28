import React, { useCallback, useMemo } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    BaseSpacer,
    BaseView,
    FadeoutButton,
    Layout,
    TransactionStatusBox,
    showErrorToast,
} from "~Components"
import { Linking } from "react-native"
import { useCopyClipboard, useTabBarBottomMargin } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DateUtils, FormattingUtils } from "~Utils"
import { InfoSectionView, NFTDetailImage } from "./Components"
import {
    selectCollectionWithContractAddress,
    selectNFTWithAddressAndTokenId,
    selectPendingTx,
    useAppSelector,
} from "~Storage/Redux"
import { striptags } from "striptags"
import { useNavigation } from "@react-navigation/native"
import { getCalendars } from "expo-localization"
import { ActivityStatus } from "~Model"

interface NFTAttributeData {
    trait_type: string
    value: string | number
}

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.NFT_DETAILS>

export const NFTDetailScreen = ({ route }: Props) => {
    const { LL, locale } = useI18nContext()
    const nav = useNavigation()
    const { onCopyToClipboard } = useCopyClipboard()
    const { iosOnlyTabBarBottomMargin } = useTabBarBottomMargin()

    const collection = useAppSelector(state =>
        selectCollectionWithContractAddress(
            state,
            route.params.collectionAddress!,
        ),
    )

    const nft = useAppSelector(state =>
        selectNFTWithAddressAndTokenId(
            state,
            route.params.collectionAddress!,
            route.params.nftTokenId,
        ),
    )

    const isPendingTx = useAppSelector(state =>
        selectPendingTx(state, nft?.id!),
    )

    const onSendPress = useCallback(
        () =>
            nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                contractAddress: route.params.collectionAddress!,
                tokenId: route.params.nftTokenId,
            }),
        [nav, route.params.collectionAddress, route.params.nftTokenId],
    )

    const onMarketPlacePress = useCallback(async () => {
        const supported = await Linking.canOpenURL(nft?.external_url ?? "")
        if (supported) {
            await Linking.openURL(nft?.external_url!)
        } else {
            showErrorToast({ text1: LL.NO_MARKETPLACE() })
        }
    }, [nft?.external_url, LL])

    const derivedDescription = useMemo(() => {
        if (nft?.description) return nft?.description
        if (collection?.description) return collection?.description
    }, [collection, nft])

    const onCopyToClipboardPress = useCallback(
        (_data: string) => {
            onCopyToClipboard(_data, LL.CONTRACT_ADDRESS())
        },
        [LL, onCopyToClipboard],
    )

    return (
        <Layout
            safeAreaTestID="NFT_Detail_Screen"
            noStaticBottomPadding
            body={
                <BaseView flex={1}>
                    {nft && <NFTDetailImage nft={nft} />}

                    <BaseSpacer height={26} />

                    {isPendingTx && (
                        <TransactionStatusBox
                            status={
                                isPendingTx
                                    ? ActivityStatus.PENDING
                                    : ActivityStatus.SUCCESS
                            }
                        />
                    )}

                    <BaseSpacer height={26} />

                    {!!nft?.attributes?.length && (
                        <InfoSectionView<NFTAttributeData[]>
                            title={LL.NFT_ATTRIBUTES()}
                            data={nft?.attributes}
                        />
                    )}

                    {collection?.name && (
                        <InfoSectionView<string>
                            title={LL.BD_COLLECTION()}
                            data={collection?.name}
                        />
                    )}

                    {collection?.totalSupply && (
                        <InfoSectionView<string>
                            title={LL.NFT_DETAIL_TOTAL_SUPPLY()}
                            data={collection.totalSupply.toString()}
                        />
                    )}

                    {derivedDescription && (
                        <InfoSectionView<string>
                            title={LL.SB_DESCRIPTION()}
                            data={striptags(derivedDescription.trim(), {
                                allowedTags: new Set(["strong"]),
                            })}
                        />
                    )}

                    {collection?.creator && (
                        <InfoSectionView<string>
                            title={LL.NFT_DETAIL_CREATOR()}
                            data={collection?.creator}
                        />
                    )}

                    {nft?.edition && (
                        <InfoSectionView<string>
                            title={LL.NFT_DETAIL_EDITION()}
                            data={nft?.edition.toString()}
                        />
                    )}

                    {nft?.external_url && (
                        <InfoSectionView<string>
                            title={LL.NFT_DETAIL_MARKETPLACE()}
                            data={"Link"}
                            action={onMarketPlacePress}
                        />
                    )}

                    {nft?.date && (
                        <InfoSectionView<string>
                            title={LL.NFT_DETAIL_MINTED_AT()}
                            data={DateUtils.formatDateTime(
                                nft?.date,
                                locale,
                                getCalendars()[0].timeZone ??
                                    DateUtils.DEFAULT_TIMEZONE,
                            )}
                        />
                    )}

                    {nft?.rank && (
                        <InfoSectionView<string>
                            title={LL.NFT_DETAIL_RANK()}
                            data={nft?.rank.toString()}
                        />
                    )}

                    {nft?.rarity && nft?.rarity !== 0 ? (
                        <InfoSectionView<string>
                            title={LL.NFT_DETAIL_RARITY()}
                            data={nft?.rarity?.toString()}
                        />
                    ) : null}

                    {!!nft?.scores?.length && (
                        <InfoSectionView<NFTAttributeData[]>
                            title={LL.NFT_DETAIL_SCORES()}
                            data={nft?.scores}
                        />
                    )}

                    {collection?.address && (
                        <InfoSectionView<string>
                            action={() =>
                                onCopyToClipboardPress(collection.address)
                            }
                            isLastInList
                            title={LL.CONTRACT_ADDRESS()}
                            data={FormattingUtils.humanAddress(
                                collection?.address ?? "",
                                5,
                                4,
                            )}
                        />
                    )}
                </BaseView>
            }
            _iosOnlyTabBarBottomMargin={iosOnlyTabBarBottomMargin}
            footer={
                <FadeoutButton
                    disabled={!!isPendingTx}
                    title={LL.SEND_TOKEN_TITLE().toUpperCase()}
                    action={onSendPress}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}
