import React from "react"
import { Animated } from "react-native"
import { DetailsContainer } from "./DetailsContainer"
import { FungibleTokenWithBalance } from "~Model"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"

type TokenReceiverCardProps = {
    token: FungibleTokenWithBalance
    amount: string
    address: string
}

export const TokenReceiverCard = ({ token, amount, address }: TokenReceiverCardProps) => {
    const { fiatBalance, showFiatBalance } = useTokenCardBalance({ token })
    return (
        <Animated.View>
            <DetailsContainer>
                <DetailsContainer.TokenValue value={amount} token={token} />
                {showFiatBalance && <DetailsContainer.FiatValue value={fiatBalance} />}
                <DetailsContainer.TokenReceiver address={address} />
            </DetailsContainer>
        </Animated.View>
    )
}
