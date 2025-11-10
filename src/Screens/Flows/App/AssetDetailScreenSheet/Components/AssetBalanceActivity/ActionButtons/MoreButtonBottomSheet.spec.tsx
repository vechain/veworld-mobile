import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { SellButton } from "./SellButton"
import { SendButton } from "./SendButton"

import { BuyButton } from "./BuyButton"
import { EarnButton } from "./EarnButton"
import { MoreButtonBottomSheet } from "./MoreButtonBottomSheet"
import { ReceiveButton } from "./ReceiveButton"
import { SwapButton } from "./SwapButton"

jest.mock("./BuyButton", () => ({
    BuyButton: {
        ...jest.requireActual("./BuyButton").BuyButton,
        use: jest.fn(),
    },
}))

jest.mock("./EarnButton", () => ({
    EarnButton: {
        ...jest.requireActual("./EarnButton").EarnButton,
        use: jest.fn(),
    },
}))

jest.mock("./ReceiveButton", () => ({
    ReceiveButton: {
        ...jest.requireActual("./ReceiveButton").ReceiveButton,
        use: jest.fn(),
    },
}))

jest.mock("./SellButton", () => ({
    SellButton: {
        ...jest.requireActual("./SellButton").SellButton,
        use: jest.fn(),
    },
}))

jest.mock("./SendButton", () => ({
    SendButton: {
        ...jest.requireActual("./SendButton").SendButton,
        use: jest.fn(),
    },
}))

jest.mock("./SwapButton", () => ({
    SwapButton: {
        ...jest.requireActual("./SwapButton").SwapButton,
        use: jest.fn(),
    },
}))

describe("MoreButtonBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should not show sell, send and swap if they are disabled", () => {
        ;(SellButton.use as jest.Mock).mockReturnValue({ disabled: true, onPress: jest.fn() })
        ;(SendButton.use as jest.Mock).mockReturnValue({ disabled: true, onPress: jest.fn() })
        ;(SwapButton.use as jest.Mock).mockReturnValue({ disabled: true, onPress: jest.fn() })

        const bsRef = { current: { present: jest.fn(), close: jest.fn() } }

        render(
            <MoreButtonBottomSheet
                bsRef={bsRef as any}
                openReceiveBottomsheet={jest.fn()}
                token={TestHelpers.data.B3TRWithBalance}
            />,
            { wrapper: TestWrapper },
        )

        act(() => {
            bsRef.current.present()
        })

        expect(screen.queryByTestId("MORE_BUTTON_BS_ITEM_SEND")).toBeNull()
        expect(screen.queryByTestId("MORE_BUTTON_BS_ITEM_SELL")).toBeNull()
        expect(screen.queryByTestId("MORE_BUTTON_BS_ITEM_SWAP")).toBeNull()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_RECEIVE")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_BUY")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_EARN")).toBeVisible()
    })
    it("should show sell if not disabled", () => {
        ;(SellButton.use as jest.Mock).mockReturnValue({ disabled: false, onPress: jest.fn() })
        ;(SendButton.use as jest.Mock).mockReturnValue({ disabled: true, onPress: jest.fn() })
        ;(SwapButton.use as jest.Mock).mockReturnValue({ disabled: false, onPress: jest.fn() })

        const bsRef = { current: { present: jest.fn(), close: jest.fn() } }

        render(
            <MoreButtonBottomSheet
                bsRef={bsRef as any}
                openReceiveBottomsheet={jest.fn()}
                token={TestHelpers.data.B3TRWithBalance}
            />,
            { wrapper: TestWrapper },
        )

        act(() => {
            bsRef.current.present()
        })

        expect(screen.queryByTestId("MORE_BUTTON_BS_ITEM_SEND")).toBeNull()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_SELL")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_RECEIVE")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_BUY")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_EARN")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_SWAP")).toBeVisible()
    })
    it("should show send if not disabled", () => {
        ;(SellButton.use as jest.Mock).mockReturnValue({ disabled: true, onPress: jest.fn() })
        ;(SendButton.use as jest.Mock).mockReturnValue({ disabled: false, onPress: jest.fn() })
        ;(SwapButton.use as jest.Mock).mockReturnValue({ disabled: false, onPress: jest.fn() })

        const bsRef = { current: { present: jest.fn(), close: jest.fn() } }

        render(
            <MoreButtonBottomSheet
                bsRef={bsRef as any}
                openReceiveBottomsheet={jest.fn()}
                token={TestHelpers.data.B3TRWithBalance}
            />,
            { wrapper: TestWrapper },
        )

        act(() => {
            bsRef.current.present()
        })

        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_SEND")).toBeVisible()
        expect(screen.queryByTestId("MORE_BUTTON_BS_ITEM_SELL")).toBeNull()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_RECEIVE")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_BUY")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_EARN")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_SWAP")).toBeVisible()
    })
    it("should show swap if not disabled", () => {
        ;(SellButton.use as jest.Mock).mockReturnValue({ disabled: false, onPress: jest.fn() })
        ;(SendButton.use as jest.Mock).mockReturnValue({ disabled: false, onPress: jest.fn() })
        ;(SwapButton.use as jest.Mock).mockReturnValue({ disabled: true, onPress: jest.fn() })

        const bsRef = { current: { present: jest.fn(), close: jest.fn() } }

        render(
            <MoreButtonBottomSheet
                bsRef={bsRef as any}
                openReceiveBottomsheet={jest.fn()}
                token={TestHelpers.data.B3TRWithBalance}
            />,
            { wrapper: TestWrapper },
        )

        act(() => {
            bsRef.current.present()
        })

        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_SEND")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_SELL")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_RECEIVE")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_BUY")).toBeVisible()
        expect(screen.getByTestId("MORE_BUTTON_BS_ITEM_EARN")).toBeVisible()
        expect(screen.queryByTestId("MORE_BUTTON_BS_ITEM_SWAP")).toBeNull()
    })

    it("should trigger the correct actions", () => {
        const onBuy = jest.fn()
        const onReceive = jest.fn()
        const onSend = jest.fn()
        const onEarn = jest.fn()
        const onSwap = jest.fn()
        const onSell = jest.fn()
        ;(BuyButton.use as jest.Mock).mockReturnValue(onBuy)
        ;(EarnButton.use as jest.Mock).mockReturnValue(onEarn)
        ;(ReceiveButton.use as jest.Mock).mockReturnValue(onReceive)
        ;(SwapButton.use as jest.Mock).mockReturnValue(onSwap)
        ;(SellButton.use as jest.Mock).mockReturnValue({ disabled: false, onPress: onSell })
        ;(SendButton.use as jest.Mock).mockReturnValue({ disabled: false, onPress: onSend })
        ;(SwapButton.use as jest.Mock).mockReturnValue({ disabled: false, onPress: onSwap })

        const bsRef = { current: { present: jest.fn(), close: jest.fn() } }

        render(
            <MoreButtonBottomSheet
                bsRef={bsRef as any}
                openReceiveBottomsheet={jest.fn()}
                token={TestHelpers.data.B3TRWithBalance}
            />,
            { wrapper: TestWrapper },
        )

        const spiedClose = jest.spyOn(bsRef.current, "close")

        act(() => {
            bsRef.current.present()
        })

        //#region Receive
        act(() => {
            fireEvent.press(screen.getByTestId("MORE_BUTTON_BS_ITEM_RECEIVE"))
        })

        expect(onReceive).toHaveBeenCalled()
        expect(spiedClose).toHaveBeenCalledTimes(1)
        //#endregion

        //#region Send
        act(() => {
            fireEvent.press(screen.getByTestId("MORE_BUTTON_BS_ITEM_SEND"))
        })

        expect(onSend).toHaveBeenCalled()
        expect(spiedClose).toHaveBeenCalledTimes(2)
        //#endregion

        //#region Buy
        act(() => {
            fireEvent.press(screen.getByTestId("MORE_BUTTON_BS_ITEM_BUY"))
        })

        expect(onBuy).toHaveBeenCalled()
        expect(spiedClose).toHaveBeenCalledTimes(3)
        //#endregion

        //#region Earn
        act(() => {
            fireEvent.press(screen.getByTestId("MORE_BUTTON_BS_ITEM_EARN"))
        })

        expect(onEarn).toHaveBeenCalled()
        expect(spiedClose).toHaveBeenCalledTimes(4)
        //#endregion

        //#region Swap
        act(() => {
            fireEvent.press(screen.getByTestId("MORE_BUTTON_BS_ITEM_SWAP"))
        })

        expect(onSwap).toHaveBeenCalled()
        expect(spiedClose).toHaveBeenCalledTimes(5)
        //#endregion

        //#region Sell
        act(() => {
            fireEvent.press(screen.getByTestId("MORE_BUTTON_BS_ITEM_SELL"))
        })

        expect(onSell).toHaveBeenCalled()
        expect(spiedClose).toHaveBeenCalledTimes(6)
        //#endregion
    })
})
