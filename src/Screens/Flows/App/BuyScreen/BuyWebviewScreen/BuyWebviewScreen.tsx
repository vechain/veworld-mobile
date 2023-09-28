import React from "react"
import { CoinbasePayWebView } from "~Components"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"

export const BuyWebviewScreen = () => {
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)

    return selectedAccountAddress ? (
        <CoinbasePayWebView
            currentAmount={0}
            destinationAddress={selectedAccountAddress}
        />
    ) : null
}
