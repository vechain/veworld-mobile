import React from "react"
import { RenderItemParams } from "react-native-draggable-flatlist"
import { FungibleTokenWithBalance } from "~Model"
import { TokenCard } from "./TokenCard"
import { TokenContainer } from "./TokenContainer"

interface IAnimatedTokenCard extends RenderItemParams<FungibleTokenWithBalance> {
    isBalanceVisible: boolean
    isEdit?: boolean
}

export const AnimatedTokenCard = ({ item, isBalanceVisible, isEdit }: IAnimatedTokenCard) => {
    return (
        <TokenContainer isEdit={isEdit}>
            <TokenCard tokenWithBalance={item} isBalanceVisible={isBalanceVisible} />
        </TokenContainer>
    )
}
