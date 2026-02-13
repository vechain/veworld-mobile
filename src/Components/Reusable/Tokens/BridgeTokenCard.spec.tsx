import React from "react"
import { render } from "@testing-library/react-native"
import { BridgeTokenCard } from "./BridgeTokenCard"
import { TestWrapper, TestHelpers } from "~Test"

const { VeBitcoinWithBalance } = TestHelpers.data

describe("BridgeTokenCard", () => {
    it("should render the component", async () => {
        const { findByText } = render(
            <BridgeTokenCard tokenWithBalance={VeBitcoinWithBalance} isBalanceVisible={true} isEdit={false} />,
            {
                wrapper: TestWrapper,
            },
        )

        const tokenSymbol = await findByText("BTC")
        await expect(tokenSymbol).toBeOnTheScreen()
    })

    it("should render the component with balance", async () => {
        const { findByText } = render(
            <BridgeTokenCard tokenWithBalance={VeBitcoinWithBalance} isBalanceVisible={true} isEdit={false} />,
            {
                wrapper: TestWrapper,
            },
        )

        const tokenSymbol = await findByText("BTC")
        const balance = await findByText("< 0.0001")

        await expect(tokenSymbol).toBeOnTheScreen()
        await expect(balance).toBeOnTheScreen()
    })

    it("should render the component with hidden balance", async () => {
        const { findByText } = render(
            <BridgeTokenCard tokenWithBalance={VeBitcoinWithBalance} isBalanceVisible={false} isEdit={false} />,
            {
                wrapper: TestWrapper,
            },
        )

        const tokenSymbol = await findByText("BTC")
        const balance = await findByText("•••••")

        await expect(tokenSymbol).toBeOnTheScreen()
        await expect(balance).toBeOnTheScreen()
    })
})
