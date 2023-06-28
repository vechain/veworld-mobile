import { StyleSheet } from "react-native"
import React, { useCallback } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    BackButtonHeader,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    FadeoutButton,
    TransferCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import {
    selectNFTWithAddressAndTokenId,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { NFTRecapView } from "./Components/NFTRecapView"
import { InfoSectionView } from "../NFTDetailScreen/Components"
import { ScrollView } from "react-native-gesture-handler"
import { usePlatformBottomInsets } from "~Hooks"
import { info } from "~Utils"

type Props = NativeStackScreenProps<
    RootStackParamListNFT,
    Routes.SEND_NFT_RECAP
>

export const SendNFTRecapScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()

    const { calculateBottomInsets } = usePlatformBottomInsets("hasStaticButton")

    const selectedAccoount = useAppSelector(selectSelectedAccount)

    const nft = useAppSelector(state =>
        selectNFTWithAddressAndTokenId(
            state,
            route.params.contractAddress,
            route.params.tokenId,
        ),
    )

    const onSendPress = useCallback(() => {
        info("onSendPress")
    }, [])

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />

            <ScrollView
                contentContainerStyle={{
                    paddingBottom: calculateBottomInsets,
                }}>
                <BaseView mx={20}>
                    <BaseText typographyFont="title">{LL.RECAP()}</BaseText>

                    <BaseSpacer height={24} />

                    <BaseView
                        flexDirection="row"
                        style={baseStyles.previewContainer}>
                        <NFTRecapView nft={nft!} />

                        <BaseView justifyContent="flex-end" h={100} mx={16}>
                            <BaseText
                                typographyFont="subTitleBold"
                                alignContainer="baseline">
                                {nft?.name ?? LL.COMMON_NOT_AVAILABLE()}
                            </BaseText>
                            <BaseText
                                typographyFont="body"
                                alignContainer="baseline">
                                #{nft!.tokenId}
                            </BaseText>
                        </BaseView>
                    </BaseView>

                    <BaseSpacer height={24} />

                    {/* TODO convert style to design specs*/}
                    <TransferCard
                        fromAddress={selectedAccoount!.address}
                        toAddresses={[route.params.receiverAddress]}
                    />

                    <BaseSpacer height={24} />

                    <InfoSectionView<string>
                        isFontReverse
                        title={"Estimated gas fee"}
                        data={"0.0003555 VET"}
                        subTtitle={"8,03 USD"}
                    />

                    <InfoSectionView<string>
                        isFontReverse
                        title={"Estimated time"}
                        data={"< 30 seconds"}
                    />

                    <InfoSectionView<string>
                        isFontReverse
                        isLastInList
                        title={"Total amount"}
                        data={"0.0003555 VET"}
                        subTtitle={"8,03 USD"}
                    />
                </BaseView>
            </ScrollView>

            <FadeoutButton
                title={LL.SEND_TOKEN_TITLE().toUpperCase()}
                action={onSendPress}
            />
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    previewContainer: {
        height: 130,
    },
})
