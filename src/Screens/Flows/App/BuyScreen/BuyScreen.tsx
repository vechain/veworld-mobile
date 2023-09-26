import React from "react"
import { CoinbasePayWebView, Layout } from "~Components"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

export const BuyScreen = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    return (
        <Layout
            fixedBody={
                <CoinbasePayWebView
                    currentAmount={0}
                    destinationAddress={selectedAccount.address}
                />
            }
        />
    )
}
