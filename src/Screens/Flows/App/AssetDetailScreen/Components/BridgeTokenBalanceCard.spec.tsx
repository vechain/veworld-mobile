import { render } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"
import { BridgeTokenBalanceCard } from "./BridgeTokenBalanceCard"

const { VeBitcoinWithCompleteInfo } = TestHelpers.data

describe("BridgeTokenBalanceCard", () => {
    it("should render the component", async () => {
        const { findByText } = render(
            <BridgeTokenBalanceCard
                token={VeBitcoinWithCompleteInfo}
                isBalanceVisible={true}
                openQRCodeSheet={jest.fn()}
                isObserved={false}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const tokenName = await findByText("BTC")
        await expect(tokenName).toBeOnTheScreen()
    })

    it("should render the component with balance", async () => {
        const { findByText } = render(
            <BridgeTokenBalanceCard
                token={VeBitcoinWithCompleteInfo}
                isBalanceVisible={true}
                openQRCodeSheet={jest.fn()}
                isObserved={false}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        const tokenSymbol = await findByText("BTC")
        const balance = await findByText("10.00")

        await expect(tokenSymbol).toBeOnTheScreen()
        await expect(balance).toBeOnTheScreen()
    })

    it("should render the component with hidden balance", async () => {
        const { findByText } = render(
            <BridgeTokenBalanceCard
                token={VeBitcoinWithCompleteInfo}
                isBalanceVisible={false}
                openQRCodeSheet={jest.fn()}
                isObserved={false}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const tokenSymbol = await findByText("BTC")
        const balance = await findByText("•••••")
        const fiatBalance = await findByText("$••••••")

        await expect(tokenSymbol).toBeOnTheScreen()
        await expect(balance).toBeOnTheScreen()
        await expect(fiatBalance).toBeOnTheScreen()
    })
})
