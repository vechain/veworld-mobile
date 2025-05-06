import React from "react"
import { render, screen } from "@testing-library/react-native"
import { TokenCard } from "./TokenCard"
import { TestWrapper, TestHelpers } from "~Test"

const { VETWithBalance } = TestHelpers.data

describe("TokenCard", () => {
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
})
