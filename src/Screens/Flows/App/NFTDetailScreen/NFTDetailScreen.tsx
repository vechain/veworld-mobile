import React from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    BaseImage,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.NFT_DETAILS>

export const NFTDetailScreen = ({ route }: Props) => {
    return (
        <BaseSafeArea grow={1}>
            <BaseText>{route.params.nft.name}</BaseText>
            <BaseText>{route.params.nft.description}</BaseText>
            <BaseImage uri={route.params.nft.image ?? ""} w={200} h={200} />

            <BaseView>
                {route.params.nft.attributes?.map(attr => (
                    <BaseView flexDirection="row" key={attr.trait_type}>
                        <BaseText typographyFont="bodyBold">
                            {attr.trait_type}
                        </BaseText>
                        <BaseSpacer width={8} />
                        <BaseText>{attr.value}</BaseText>
                    </BaseView>
                ))}
            </BaseView>
        </BaseSafeArea>
    )
}
