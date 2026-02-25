import { useNavigation } from "@react-navigation/native"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import _ from "lodash"
import React, { PropsWithChildren } from "react"

import { TestHelpers, TestWrapper } from "~Test"

import { FeatureFlagsContext, initialState } from "~Components"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "~Storage/Redux/Types"

import PlatformUtils from "~Utils/PlatformUtils"

import { SellButton } from "./SellButton"

jest.mock("~Utils/PlatformUtils")
jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
}))

describe("SellButton", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should display it when is android", () => {
        const nav = { replace: jest.fn() }
        ;(PlatformUtils.isAndroid as jest.Mock).mockReturnValue(true)
        ;(useNavigation as jest.Mock).mockReturnValue(nav)
        render(<SellButton token={TestHelpers.data.VETWithBalance} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("SELL_BUTTON")).toBeVisible()

        act(() => {
            fireEvent.press(screen.getByTestId("SELL_BUTTON"))
        })

        expect(nav.replace).toHaveBeenCalled()
    })
    it("should not display it when is not android", () => {
        ;(PlatformUtils.isAndroid as jest.Mock).mockReturnValue(false)
        render(<SellButton token={TestHelpers.data.VETWithBalance} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("SELL_BUTTON")).toBeNull()
    })
    it("should not display it when the coinify FF is off", () => {
        const wrappedWrapper = (props: PropsWithChildren<{ preloadedState: Partial<RootState> }>) => {
            return (
                <FeatureFlagsContext.Provider
                    value={_.setWith(
                        { ...initialState, isLoading: false },
                        "paymentProvidersFeature.coinify.android",
                        false,
                    )}>
                    <TestWrapper {...props} />
                </FeatureFlagsContext.Provider>
            )
        }
        ;(PlatformUtils.isAndroid as jest.Mock).mockReturnValue(true)
        render(<SellButton token={TestHelpers.data.VETWithBalance} />, {
            wrapper: wrappedWrapper,
        })
        expect(screen.queryByTestId("SELL_BUTTON")).toBeNull()
    })
    it("should not display it when account is observed", () => {
        ;(PlatformUtils.isAndroid as jest.Mock).mockReturnValue(true)
        TestHelpers.render.renderComponentWithProps(<SellButton token={TestHelpers.data.VETWithBalance} />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    accounts: {
                        accounts: [
                            {
                                address: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                alias: "Account 1",
                                index: 0,
                                rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                                visible: true,
                                type: DEVICE_TYPE.LOCAL_WATCHED,
                            },
                        ],
                        selectedAccount: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    },
                },
            },
        })
        expect(screen.queryByTestId("SELL_BUTTON")).toBeNull()
    })
    it("should not display it when balance is zero", () => {
        ;(PlatformUtils.isAndroid as jest.Mock).mockReturnValue(true)
        TestHelpers.render.renderComponentWithProps(
            <SellButton
                token={{
                    ...TestHelpers.data.VETWithBalance,
                    balance: { ...TestHelpers.data.VETWithBalance.balance, balance: "0" },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        expect(screen.queryByTestId("SELL_BUTTON")).toBeNull()
    })
})
