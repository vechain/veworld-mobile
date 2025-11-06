import { render, screen, within } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { View } from "react-native"

import { TestHelpers, TestWrapper } from "~Test"

import { useExchangeRate } from "~Api/Coingecko"

import { VOT3 } from "~Constants"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { Balance } from "~Model"
import { AddressUtils } from "~Utils"
import { BalanceTab } from "./BalanceTab"

jest.mock("./BalanceTabActions", () => ({
    BalanceTabActions: View,
}))

jest.mock("~Api/Coingecko", () => ({
    ...jest.requireActual("~Api/Coingecko"),
    useExchangeRate: jest.fn(),
}))

jest.mock("~Hooks/useTokenBalance", () => ({
    useTokenBalance: jest.fn().mockReturnValue({ data: undefined }),
}))

describe("BalanceTab", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should show the dollar value if the token has an exchange rate to usd", () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({ data: 1 })
        render(
            <BalanceTab
                token={{
                    ...TestHelpers.data.VETWithBalance,
                    balance: {
                        ...TestHelpers.data.VETWithBalance.balance,
                        balance: ethers.utils.parseEther("1").toString(),
                    },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId("TOKEN_VALUE_VALUE")).toHaveTextContent("1.00")
        expect(screen.getByTestId("DOLLAR_VALUE_VALUE")).toHaveTextContent("$1.00")
    })
    it("should not show the dollar value if the token does not have an exchange rate to usd", () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({ data: null })
        render(
            <BalanceTab
                token={{
                    ...TestHelpers.data.VETWithBalance,
                    symbol: "TEST_SYMBOL",
                    balance: {
                        ...TestHelpers.data.VETWithBalance.balance,
                        balance: ethers.utils.parseEther("1").toString(),
                    },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId("TOKEN_VALUE_VALUE")).toHaveTextContent("1.00")
        expect(screen.queryByTestId("DOLLAR_VALUE_VALUE")).toBeNull()
    })
    it("should show both VOT3 and B3TR balances", () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({ data: 1 })
        ;(useTokenBalance as jest.Mock).mockImplementation(({ tokenAddress }: { tokenAddress: string }) => {
            if (AddressUtils.compareAddresses(tokenAddress, VOT3.address))
                return {
                    data: {
                        balance: ethers.utils.parseEther("2").toString(),
                        isHidden: false,
                        timeUpdated: new Date().toISOString(),
                        tokenAddress: tokenAddress,
                    } satisfies Balance,
                }
            return {
                data: {
                    balance: ethers.utils.parseEther("1").toString(),
                    isHidden: false,
                    timeUpdated: new Date().toISOString(),
                    tokenAddress: tokenAddress,
                } satisfies Balance,
            }
        })
        render(<BalanceTab token={TestHelpers.data.B3TRWithBalance} />, {
            wrapper: TestWrapper,
        })

        expect(within(screen.getByTestId("TOKEN_VALUE_B3TR")).getByTestId("TOKEN_VALUE_VALUE")).toHaveTextContent(
            "1.00",
        )
        expect(within(screen.getByTestId("TOKEN_VALUE_VOT3")).getByTestId("TOKEN_VALUE_VALUE")).toHaveTextContent(
            "2.00",
        )
        expect(screen.getByTestId("DOLLAR_VALUE_VALUE")).toHaveTextContent("$3.00")
    })
})
