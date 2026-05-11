import { render, screen, within } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { View } from "react-native"

import { TestHelpers, TestWrapper } from "~Test"

import { useExchangeRate } from "~Api/Coingecko"

import { VOT3 } from "~Constants"
import { useGetLockedVot3Balance, useGetUnlockedVot3Balance, useUserHasNavigator } from "~Hooks/VeBetterDao"
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

jest.mock("~Hooks/VeBetterDao", () => ({
    useUserHasNavigator: jest.fn(),
    useGetUnlockedVot3Balance: jest.fn(),
    useGetLockedVot3Balance: jest.fn(),
}))

describe("BalanceTab", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useTokenBalance as jest.Mock).mockReturnValue({ data: undefined })
        ;(useUserHasNavigator as jest.Mock).mockReturnValue({ data: false })
        ;(useGetUnlockedVot3Balance as jest.Mock).mockReturnValue({ data: undefined })
        ;(useGetLockedVot3Balance as jest.Mock).mockReturnValue({ data: undefined })
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

        expect(
            within(screen.getByTestId("TOKEN_FIAT_VALUE_B3TR")).getByTestId("TOKEN_FIAT_VALUE_TOKEN_VALUE"),
        ).toHaveTextContent("1.00")
        expect(
            within(screen.getByTestId("TOKEN_FIAT_VALUE_B3TR")).getByTestId("TOKEN_FIAT_VALUE_FIAT_VALUE"),
        ).toHaveTextContent("$1.00")
        expect(
            within(screen.getByTestId("TOKEN_FIAT_VALUE_VOT3")).getByTestId("TOKEN_FIAT_VALUE_TOKEN_VALUE"),
        ).toHaveTextContent("2.00")
        expect(
            within(screen.getByTestId("TOKEN_FIAT_VALUE_VOT3")).getByTestId("TOKEN_FIAT_VALUE_FIAT_VALUE"),
        ).toHaveTextContent("$2.00")
        expect(screen.getByTestId("DOLLAR_VALUE_VALUE")).toHaveTextContent("$3.00")
    })
    it("should render the locked navigator row when user has a navigator with a locked VOT3 balance", () => {
        const unlockedBalance = ethers.utils.parseEther("2")
        const lockedBalance = ethers.utils.parseEther("10")
        ;(useExchangeRate as jest.Mock).mockReturnValue({ data: 1 })
        ;(useUserHasNavigator as jest.Mock).mockReturnValue({ data: true })
        ;(useGetUnlockedVot3Balance as jest.Mock).mockReturnValue({
            data: {
                original: unlockedBalance.toBigInt(),
                hex: unlockedBalance.toHexString(),
                scaled: "2",
                formatted: "2.00",
            },
        })
        ;(useGetLockedVot3Balance as jest.Mock).mockReturnValue({
            data: {
                original: lockedBalance.toBigInt(),
                hex: lockedBalance.toHexString(),
                scaled: "10",
                formatted: "10.00",
            },
        })
        ;(useTokenBalance as jest.Mock).mockImplementation(({ tokenAddress }: { tokenAddress: string }) => {
            if (AddressUtils.compareAddresses(tokenAddress, VOT3.address))
                return {
                    data: {
                        balance: ethers.utils.parseEther("12").toString(),
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

        expect(
            within(screen.getByTestId("TOKEN_FIAT_VALUE_VOT3")).getByTestId("TOKEN_FIAT_VALUE_TOKEN_VALUE"),
        ).toHaveTextContent("2.00")
        const delegatedValueRow = screen.getByTestId("DELEGATED_VALUE_VOT3")
        expect(within(delegatedValueRow).getByText("Delegated VOT3")).toBeTruthy()
        expect(within(delegatedValueRow).getByTestId("DELEGATED_VALUE_INFO_BUTTON")).toBeTruthy()
        expect(within(delegatedValueRow).getByTestId("DELEGATED_VALUE_TOKEN_VALUE")).toHaveTextContent("10.00")
        expect(within(delegatedValueRow).getByTestId("DELEGATED_VALUE_FIAT_VALUE")).toHaveTextContent("$10.00")
        expect(screen.getByTestId("DOLLAR_VALUE_VALUE")).toHaveTextContent("$13.00")
        expect(screen.getAllByText("Delegated VOT3").length).toBeGreaterThan(1)
        expect(
            screen.getByText(
                // eslint-disable-next-line max-len
                "Delegated VOT3 are assigned to a Navigator strategy. They still belong to you, but they are not available for conversion or transfer until undelegated.",
            ),
        ).toBeTruthy()
    })
    it("should NOT render the locked row when user has no navigator", () => {
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

        expect(screen.queryByTestId("DELEGATED_VALUE_VOT3")).toBeNull()
    })
})
