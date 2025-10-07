import { render } from "@testing-library/react-native"
import React from "react"
import { FungibleTokenWithBalance, TokenWithCompleteInfo } from "~Model"
import { Routes } from "~Navigation"
import { TestHelpers, TestWrapper } from "~Test"
import { BridgeAssetDetailScreen } from "./BridgeAssetDetailScreen"

const { VeBitcoinWithBalance } = TestHelpers.data

jest.mock("react-native-wagmi-charts", () => {
    return {
        useLineChartDatetime: jest.fn(),
        LineChart: {
            default: jest.fn(),
            Provider: jest.fn(),
        },
    }
})

const navigationMock = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(),
    dispatch: jest.fn(),
    getState: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    getId: jest.fn(),
    reset: jest.fn(),
    getParent: jest.fn(),
    removeListener: jest.fn(),
    pop: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    popToTop: jest.fn(),
}

jest.mock("~Hooks/useTokenWithCompleteInfo", () => ({
    useTokenWithCompleteInfo: jest.fn().mockImplementation((token: FungibleTokenWithBalance) => {
        return {
            ...token,
        } satisfies TokenWithCompleteInfo
    }),
}))

jest.mock("~Hooks/useTokenCardFiatInfo", () => ({
    useTokenCardFiatInfo: jest.fn().mockImplementation(() => {
        return {
            change24h: 1,
            exchangeRate: 1,
            isPositive24hChange: true,
            isLoading: false,
        }
    }),
}))

describe("BridgeAssetDetailScreen", () => {
    it("should render the screen", async () => {
        const { findAllByText } = render(
            <BridgeAssetDetailScreen
                route={{
                    params: { token: VeBitcoinWithBalance },
                    key: "1",
                    name: Routes.BRIDGE_TOKEN_DETAILS,
                }}
                navigation={navigationMock}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const title = await findAllByText("BTC@vechain")
        expect(title[0]).toBeTruthy()
    })
})
