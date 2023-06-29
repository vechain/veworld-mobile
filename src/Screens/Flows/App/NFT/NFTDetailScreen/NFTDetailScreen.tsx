import React, { useCallback, useMemo } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    BackButtonHeader,
    BaseSafeArea,
    BaseSpacer,
    BaseView,
    FadeoutButton,
    showErrorToast,
} from "~Components"
import { ScrollView, Linking } from "react-native"
import { useCopyClipboard, usePlatformBottomInsets } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DateUtils, FormattingUtils } from "~Utils"
import { InfoSectionView, NFTDetailImage } from "./Components"
import {
    selectCollectionWithContractAddress,
    selectNFTWithAddressAndTokenId,
    useAppSelector,
} from "~Storage/Redux"
import { striptags } from "striptags"
import { useNavigation } from "@react-navigation/native"

interface NFTAttributeData {
    trait_type: string
    value: string | number
}

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.NFT_DETAILS>

export const NFTDetailScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const { calculateBottomInsets } = usePlatformBottomInsets("hasStaticButton")
    const nav = useNavigation()
    const { onCopyToClipboard } = useCopyClipboard()

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

    const onSendPress = useCallback(
        () =>
            nav.navigate(Routes.SEND_NFT, {
                contractAddress: route.params.collectionAddress!,
                tokenId: route.params.nftTokenId!,
            }),
        [nav, route.params.collectionAddress, route.params.nftTokenId],
    )

    const onMarketPlacePress = useCallback(async () => {
        const supported = await Linking.canOpenURL(nft?.external_url ?? "")
        if (supported) {
            await Linking.openURL(nft?.external_url!)
        } else {
            showErrorToast(LL.NO_MARKETPLACE())
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

    // todo - add LL for headers
    return (
        <BaseSafeArea grow={1} testID="NFT_Detail_Screen">
            <BackButtonHeader hasBottomSpacer={false} />
            <BaseView flex={1} mx={20}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: calculateBottomInsets,
                    }}>
                    <BaseSpacer height={26} />

                    <NFTDetailImage
                        uri={nft?.icon?.url ?? ""}
                        mime={nft?.icon?.mime ?? ""}
                        name={nft?.name ?? ""}
                        tokenId={nft?.tokenId ?? ""}
                    />

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
                            title={"Total Supply"}
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
                            title={"Creator"}
                            data={collection?.creator}
                        />
                    )}

                    {nft?.edition && (
                        <InfoSectionView<string>
                            title={"Edition"}
                            data={nft?.edition.toString()}
                        />
                    )}

                    {nft?.external_url && (
                        <InfoSectionView<string>
                            title={"Marketplace"}
                            data={"Link"}
                            action={onMarketPlacePress}
                        />
                    )}

                    {nft?.date && (
                        <InfoSectionView<string>
                            title={"Minted At"}
                            data={DateUtils.formatDateTime(
                                nft?.date,
                                // todo - get loacale
                                "en",
                                "UTC",
                            )}
                        />
                    )}

                    {nft?.rank && (
                        <InfoSectionView<string>
                            title={"Rank"}
                            data={nft?.rank.toString()}
                        />
                    )}

                    {nft && nft.rarity && nft.rarity !== 0 ? (
                        <InfoSectionView<string>
                            title={"Rarity"}
                            data={nft?.rarity?.toString()}
                        />
                    ) : null}

                    {!!nft?.scores?.length && (
                        <InfoSectionView<NFTAttributeData[]>
                            title={"Scores"}
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
                </ScrollView>
            </BaseView>

            <FadeoutButton
                title={LL.SEND_TOKEN_TITLE().toUpperCase()}
                action={onSendPress}
            />
        </BaseSafeArea>
    )
}
