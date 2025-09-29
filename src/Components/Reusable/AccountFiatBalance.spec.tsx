import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { screen } from "@testing-library/react-native"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import AccountFiatBalance from "./AccountFiatBalance"

const { renderComponentWithProps } = TestHelpers.render

jest.mock("~Hooks/useTotalFiatBalance", () => ({
    useTotalFiatBalance: jest.fn(),
}))
describe("AccountFiatBalance", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render correct balances", () => {
        ;(useTotalFiatBalance as jest.Mock).mockReturnValue({
            isLoading: false,
            balances: ["1.00", "1.00", "< 0.01", "2.00"],
        })
        renderComponentWithProps(<AccountFiatBalance isVisible />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("fiat-balance")).toHaveTextContent("$4.00")
    })
})
