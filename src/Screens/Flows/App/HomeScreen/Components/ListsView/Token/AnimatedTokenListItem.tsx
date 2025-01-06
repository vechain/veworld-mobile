import React, { memo } from "react"
import { TokenContainer } from "./TokenContainer"
import { TokenWithCompleteInfo } from "~Hooks"
import { VechainTokenCard } from "./VechainTokenCard"
import { TokenCard } from "./TokenCard"
import { FungibleTokenWithBalance } from "~Model"
import { RenderItemParams } from "react-native-draggable-flatlist"
import { B3TR } from "~Constants"
import { VeB3trTokenCard } from "./VeB3trTokenCard"

interface BaseProps {
    isEdit: boolean
    isBalanceVisible: boolean
}

interface VetTokenCardProps extends BaseProps {
    type: "vetEcosystem"
    tokenWithInfo: TokenWithCompleteInfo
    onPress: () => void
}

interface NonVetTokenCardProps extends BaseProps, RenderItemParams<FungibleTokenWithBalance> {
    type: "nonVet"
    onTokenPress: (token: FungibleTokenWithBalance) => void
}

type Props = VetTokenCardProps | NonVetTokenCardProps

export const AnimatedTokenListItem = memo((props: Props) => {
    const { isEdit, isBalanceVisible } = props

    if (props.type === "vetEcosystem") {
        const { tokenWithInfo, onPress } = props
        const isB3tr = tokenWithInfo.symbol === B3TR.symbol

        return (
            <TokenContainer isEdit={isEdit} onPress={onPress}>
                {isB3tr ? (
                    <VeB3trTokenCard
                        isBalanceVisible={isBalanceVisible}
                        b3trToken={tokenWithInfo}
                        isAnimation={isEdit}
                    />
                ) : (
                    <VechainTokenCard
                        isBalanceVisible={isBalanceVisible}
                        tokenWithInfo={tokenWithInfo}
                        isAnimation={isEdit}
                    />
                )}
            </TokenContainer>
        )
    }

    const { item, onTokenPress } = props

    return (
        <TokenContainer isEdit={isEdit} onPress={() => onTokenPress(item)}>
            <TokenCard tokenWithBalance={item} isBalanceVisible={isBalanceVisible} />
        </TokenContainer>
    )
})
