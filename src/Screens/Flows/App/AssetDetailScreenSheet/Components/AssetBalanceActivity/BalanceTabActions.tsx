import { RouteProp, useRoute } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo } from "react"
import { BaseView } from "~Components"
import { useBottomSheetModal, useCameraBottomSheet } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { ConvertBetterBottomSheet, ConvertedBetterBottomSheet } from "~Screens/Flows/App/AssetDetailScreen/Components"
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
    const route = useRoute<RouteProp<RootStackParamListHome, Routes.TOKEN_DETAILS>>()
    const betterConversionResult = useMemo(
        () => route.params.betterConversionResult,
        [route.params.betterConversionResult],
    )
    const {
        ref: convertBetterSuccessBottomSheetRef,
        onOpen: openConvertSuccessBetterSheet,
        onClose: closeConvertSuccessBetterSheet,
    } = useBottomSheetModal()
    const { ref: convertB3trBsRef, onClose } = useBottomSheetModal()

    const onFailedConversion = useCallback(() => {
        closeConvertSuccessBetterSheet()
        convertB3trBsRef.current?.present()
    }, [closeConvertSuccessBetterSheet, convertB3trBsRef])

    useEffect(() => {
        if (betterConversionResult) {
            openConvertSuccessBetterSheet()
        }
    }, [betterConversionResult, openConvertSuccessBetterSheet])

    const { RenderCameraModal, handleOpenOnlyReceiveCamera } = useCameraBottomSheet({
        targets: [],
    })

    const allActions = useMemo(() => {
        return {
            RECEIVE: <ReceiveButton onOpenBottomsheet={handleOpenOnlyReceiveCamera} key={"RECEIVE"} />,
            SEND: <SendButton token={token} key={"SEND"} />,
            BUY: <BuyButton key={"BUY"} />,
            EARN: <EarnButton key={"EARN"} />,
            SWAP: <SwapButton token={token} key={"SWAP"} />,
            MORE: <MoreButton openReceiveBottomsheet={handleOpenOnlyReceiveCamera} token={token} key={"MORE"} />,
            CONVERT: <ConvertButton bsRef={convertB3trBsRef} key={"CONVERT"} />,
        }
    }, [handleOpenOnlyReceiveCamera, convertB3trBsRef, token])

    const tokenActions = useMemo<(keyof typeof allActions)[]>(() => {
        switch (token.symbol) {
            case "VET":
                return ["RECEIVE", "SEND", "BUY", "EARN", "MORE"]
            case "VTHO":
                return ["RECEIVE", "SEND", "BUY", "EARN", "SWAP"]
            case "VOT3":
            case "B3TR":
                return ["RECEIVE", "SEND", "CONVERT", "SWAP"]
            case "veDelegate":
                return ["RECEIVE", "SEND", "SWAP"]
            default:
                return ["RECEIVE", "SEND", "SWAP"]
        }
    }, [token.symbol])

    return (
        <BaseView flexDirection="row" gap={22} justifyContent="space-evenly">
            {tokenActions.map(action => allActions[action])}
            <ConvertBetterBottomSheet ref={convertB3trBsRef} onClose={onClose} />
            <ConvertedBetterBottomSheet
                ref={convertBetterSuccessBottomSheetRef}
                onClose={closeConvertSuccessBetterSheet}
                onFailure={onFailedConversion}
                {...betterConversionResult}
            />

            {RenderCameraModal}
        </BaseView>
    )
}
