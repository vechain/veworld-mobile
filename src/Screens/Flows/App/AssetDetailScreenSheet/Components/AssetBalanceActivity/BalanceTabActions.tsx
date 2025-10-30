import React from "react"
import { BaseView } from "~Components"
import { useCameraBottomSheet } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { BuyButton } from "./ActionButtons/BuyButton"
import { EarnButton } from "./ActionButtons/EarnButton"
import { MoreButton } from "./ActionButtons/MoreButton"
import { ReceiveButton } from "./ActionButtons/ReceiveButton"
import { SendButton } from "./ActionButtons/SendButton"

type Props = {
    token: FungibleTokenWithBalance
}

export const BalanceTabActions = ({ token }: Props) => {
    const { RenderCameraModal, handleOpenOnlyReceiveCamera } = useCameraBottomSheet({
        targets: [],
    })

    return (
        <BaseView flexDirection="row" gap={24}>
            <ReceiveButton onOpenBottomsheet={handleOpenOnlyReceiveCamera} />
            <SendButton token={token} />
            <BuyButton />
            <EarnButton />
            <MoreButton openReceiveBottomsheet={handleOpenOnlyReceiveCamera} />

            {RenderCameraModal}
        </BaseView>
    )
}
