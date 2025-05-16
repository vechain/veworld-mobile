import React from "react"
import { render } from "@testing-library/react-native"
import { BridgeAssetDetailScreen } from "./BridgeAssetDetailScreen"
import { TestWrapper, TestHelpers } from "~Test"
import { Routes } from "~Navigation"

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

describe("BridgeAssetDetailScreen", () => {
    it("should render the screen", async () => {
        const { findByText } = render(
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

        const title = await findByText("VeBitcoin")
        await expect(title).toBeTruthy()
    })
})
