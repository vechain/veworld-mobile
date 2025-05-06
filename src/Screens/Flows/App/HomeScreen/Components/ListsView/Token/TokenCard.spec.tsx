import React from "react"
import { render, screen } from "@testing-library/react-native"
import { TokenCard } from "./TokenCard"
import { TestWrapper, TestHelpers } from "~Test"
import { useVechainStatsTokenInfo } from "~Api/Coingecko"

const { VETWithBalance, CustomTokenWithBalance } = TestHelpers.data

jest.mock("~Api/Coingecko", () => ({
    ...jest.requireActual("~Api/Coingecko"),
    useVechainStatsTokenInfo: jest.fn(() => ({
        data: "0.02",
    })),
}))

describe("TokenCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("renders correctly", () => {
        render(<TokenCard tokenWithBalance={VETWithBalance} isEdit={false} isBalanceVisible={true} />, {
            wrapper: TestWrapper,
        })
    })

    it("renders correctly with balance hidden", () => {
        render(<TokenCard tokenWithBalance={VETWithBalance} isEdit={false} isBalanceVisible={false} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByText(VETWithBalance.balance.balance)).not.toBeOnTheScreen()
        expect(screen.queryByText("•••••")).toBeOnTheScreen()
    })

    it("renders correctly without fiat balance", () => {
        ;(useVechainStatsTokenInfo as jest.Mock).mockResolvedValueOnce({
            data: undefined,
        })
        render(<TokenCard tokenWithBalance={CustomTokenWithBalance} isEdit={false} isBalanceVisible={false} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("fiat-balance")).not.toBeOnTheScreen()
    })

    it("renders correctly with fiat balance", () => {
        render(<TokenCard tokenWithBalance={VETWithBalance} isEdit={false} isBalanceVisible={true} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("fiat-balance")).toBeOnTheScreen()
    })
})
