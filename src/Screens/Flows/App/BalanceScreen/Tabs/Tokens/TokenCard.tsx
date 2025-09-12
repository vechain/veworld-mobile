import { default as React, useMemo } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS, VET } from "~Constants"
import { FungibleTokenWithBalance } from "~Model"
import { AddressUtils } from "~Utils"

type Props = {
    token: FungibleTokenWithBalance
}

export const TokenCard = ({ token }: Props) => {
    const name = useMemo(() => {
        switch (token.symbol) {
            case "VET":
                return "VeChain"
            case "VTHO":
                return "VeThor"
            case "B3TR":
                return "VeBetter"
            case "VOT3":
                return "VeBetter"
            default:
                return token.name
        }
    }, [token.name, token.symbol])

    return (
        <BaseView flexDirection="row" p={16} bg={COLORS.WHITE}>
            <TokenImage
                icon={token.icon}
                isVechainToken={AddressUtils.compareAddresses(VET.address, token.address)}
                iconSize={32}
                isCrossChainToken={!!token.crossChainProvider}
            />
            <BaseSpacer width={16} />

            <BaseView flexDirection="column">
                <BaseText typographyFont="bodySemiBold" color={COLORS.GREY_800}>
                    {name}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
