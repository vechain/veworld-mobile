import React from "react"
import { Animated } from "react-native"
import { DetailsContainer } from "./DetailsContainer"
import { FungibleTokenWithBalance } from "~Model"

type TokenReceiverCardProps = {
    token: FungibleTokenWithBalance
    amount: string
    fiatAmount?: string
    amountInFiat: boolean
    address: string
}

export const TokenReceiverCard = ({ token, amount, fiatAmount, amountInFiat, address }: TokenReceiverCardProps) => {
    return (
        <Animated.View>
            <DetailsContainer>
                {amountInFiat ? (
                    <>
                        {fiatAmount && <DetailsContainer.FiatValue value={fiatAmount} />}
                        <DetailsContainer.TokenValue value={amount} token={token} />
                    </>
                ) : (
                    <>
                        <DetailsContainer.TokenValue value={amount} token={token} />
                        {fiatAmount && <DetailsContainer.FiatValue value={fiatAmount} />}
                    </>
                )}
                <DetailsContainer.TokenReceiver address={address} />
            </DetailsContainer>
        </Animated.View>
    )
}
