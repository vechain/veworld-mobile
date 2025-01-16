import React from "react"
import { TokenWithCompleteInfo } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { RenderItemParams } from "react-native-draggable-flatlist"
import { B3TR } from "~Constants"
import { VeB3trTokenCard, TokenCard, VechainTokenCard, TokenContainer } from "~Screens"

interface BaseProps {
    isBalanceVisible: boolean
}

interface VetTokenCardProps extends BaseProps {
    isVechainToken: true
    tokenWithInfo: TokenWithCompleteInfo
    onPress: () => void
}

interface NonVetTokenCardProps extends BaseProps, RenderItemParams<FungibleTokenWithBalance> {
    isVechainToken: false
    onTokenPress: (token: FungibleTokenWithBalance) => void
}

type Props = VetTokenCardProps | NonVetTokenCardProps

export const AnimatedTokenListItem = (props: Props) => {
    const { isBalanceVisible } = props

    if (props.isVechainToken) {
        const { tokenWithInfo, onPress } = props
        const isB3tr = tokenWithInfo.symbol === B3TR.symbol

        return (
            <TokenContainer onPress={onPress}>
                {isB3tr ? (
                    <VeB3trTokenCard isBalanceVisible={isBalanceVisible} />
                ) : (
                    <VechainTokenCard isBalanceVisible={isBalanceVisible} tokenWithInfo={tokenWithInfo} />
                )}
            </TokenContainer>
        )
    }

    const { item, onTokenPress } = props

    return (
        <TokenContainer onPress={() => onTokenPress(item)}>
            <TokenCard tokenWithBalance={item} isBalanceVisible={isBalanceVisible} />
        </TokenContainer>
    )
}
