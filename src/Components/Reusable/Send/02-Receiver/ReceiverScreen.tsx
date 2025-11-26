import React from "react"
import { WalletAddressCard } from "./Components/WalletAddressCard"
import { BaseView } from "~Components/Base"

export const ReceiverScreen = () => {
    return (
        <BaseView flex={1} flexDirection="column" gap={8}>
            <WalletAddressCard />
        </BaseView>
    )
}

// const baseStyles = () => StyleSheet.create({})
