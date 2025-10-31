import React, { useMemo } from "react"
import { BaseView } from "~Components"
import { useBottomSheetModal, useCameraBottomSheet } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { ConvertBetterBottomSheet } from "~Screens/Flows/App/AssetDetailScreen/Components"
import { BuyButton } from "./ActionButtons/BuyButton"
import { ConvertButton } from "./ActionButtons/ConvertButton"
import { EarnButton } from "./ActionButtons/EarnButton"
import { MoreButton } from "./ActionButtons/MoreButton"
import { ReceiveButton } from "./ActionButtons/ReceiveButton"
import { SendButton } from "./ActionButtons/SendButton"
import { SwapButton } from "./ActionButtons/SwapButton"

type Props = {
    token: FungibleTokenWithBalance
}

export const BalanceTabActions = ({ token }: Props) => {
    const { ref, onClose } = useBottomSheetModal()
    const { RenderCameraModal, handleOpenOnlyReceiveCamera } = useCameraBottomSheet({
        targets: [],
    })

    const allActions = useMemo(() => {
        return {
            RECEIVE: <ReceiveButton onOpenBottomsheet={handleOpenOnlyReceiveCamera} key={"RECEIVE"} />,
            SEND: <SendButton token={token} key={"SEND"} />,
            BUY: <BuyButton key={"BUY"} />,
            EARN: <EarnButton key={"EARN"} />,
            SWAP: <SwapButton key={"SWAP"} />,
            MORE: <MoreButton openReceiveBottomsheet={handleOpenOnlyReceiveCamera} token={token} key={"MORE"} />,
            CONVERT: <ConvertButton bsRef={ref} key={"CONVERT"} />,
        }
    }, [handleOpenOnlyReceiveCamera, ref, token])

    const tokenActions = useMemo<(keyof typeof allActions)[]>(() => {
        switch (token.symbol) {
            case "VET":
                return ["RECEIVE", "SEND", "BUY", "EARN", "MORE"]
            case "VTHO":
                return ["RECEIVE", "SEND", "BUY", "EARN", "SWAP"]
            case "VOT3":
            case "B3TR":
                return ["RECEIVE", "SEND", "CONVERT", "SWAP"]
            default:
                return ["RECEIVE", "SEND", "SWAP"]
        }
    }, [token.symbol])

    return (
        <BaseView flexDirection="row" gap={24} justifyContent="center">
            {tokenActions.map(action => allActions[action])}
            <ConvertBetterBottomSheet ref={ref} onClose={onClose} />

            {RenderCameraModal}
        </BaseView>
    )
}
