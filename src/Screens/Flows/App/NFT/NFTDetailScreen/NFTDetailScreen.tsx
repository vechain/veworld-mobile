import React, { useCallback } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import { BaseIcon, BaseSafeArea, BaseSpacer, BaseView } from "~Components"
import { ScrollView, StyleSheet } from "react-native"
import { usePlatformBottomInsets, useTheme } from "~Common"
import { useNavigation } from "@react-navigation/native"
import { useI18nContext } from "~i18n"
import { isEmpty } from "lodash"
import { FormattingUtils } from "~Utils"
import { InfoSectionView, NFTDetailImage } from "./Components"

interface NFTAttributeData {
    trait_type: string
    value: string | number
}

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.NFT_DETAILS>

export const NFTDetailScreen = ({ route }: Props) => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { calculateBottomInsets } = usePlatformBottomInsets()

    const onGoBack = useCallback(() => nav.goBack(), [nav])

    return (
        <BaseSafeArea grow={1} testID="NFT_Detail_Screen">
            <BaseView flex={1} mx={20}>
                <BaseIcon
                    style={baseStyles.backIcon}
                    size={36}
                    name="chevron-left"
                    color={theme.colors.text}
                    action={onGoBack}
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: calculateBottomInsets,
                    }}>
                    <BaseSpacer height={26} />

                    <NFTDetailImage
                        image={route.params.nft.image ?? ""}
                        name={route.params.nft.name ?? ""}
                        tokenId={route.params.nft.tokenId ?? ""}
                    />

                    <BaseSpacer height={26} />

                    <InfoSectionView<NFTAttributeData[]>
                        title={LL.NFT_ATTRIBUTES()}
                        data={route.params.nft.attributes ?? []}
                    />

                    <InfoSectionView<string>
                        title={LL.BD_COLLECTION()}
                        data={route.params.collection?.name ?? ""}
                    />

                    <InfoSectionView<string>
                        title={LL.SB_DESCRIPTION()}
                        data={
                            !isEmpty(route.params.collection?.description)
                                ? route.params.collection?.description ?? ""
                                : LL.BD_NFT_DESC_PLACEHOLDER()
                        }
                    />

                    <InfoSectionView<string>
                        isLastInList
                        title={LL.CONTRACT_ADDRESS()}
                        data={FormattingUtils.humanAddress(
                            route.params.collection?.address!,
                            5,
                            4,
                        )}
                    />
                </ScrollView>
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: -12,
        alignSelf: "flex-start",
    },

    nftImage: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },

    nftContainer: {
        height: 72,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },

    border: {
        height: 1,
    },
})
