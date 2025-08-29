import React from "react"
import { renderHook } from "@testing-library/react-hooks"
import { FeatureFlagsProvider, useFeatureFlags } from "./FeatureFlagsProvider"
import { TestWrapper } from "~Test"
import DeviceInfo from "react-native-device-info"
import { RootState } from "~Storage/Redux/Types"

jest.mock("~Api/FeatureFlags", () => ({
    getFeatureFlags: jest.fn().mockResolvedValue({
        marketsProxyFeature: {
            enabled: "1.0.0",
            url: "https://coin-api.veworld.vechain.org",
            fallbackUrl: "https://api.coingecko.com/api/v3",
        },
        betterWorldFeature: {
            appsScreen: {
                enabled: "2.4.1",
            },
        },
    }),
}))

// Mock the methods from react-native-device-info
jest.mock("react-native-device-info", () => ({
    getVersion: jest.fn(),
}))

const createWrapper = ({
    children,
    preloadedState,
}: {
    children: React.ReactNode
    preloadedState: Partial<RootState>
}) => (
    <TestWrapper preloadedState={preloadedState}>
        <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
    </TestWrapper>
)

describe("FeatureFlagsProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return feature flags", () => {
        const { result } = renderHook(() => useFeatureFlags(), {
            wrapper: createWrapper,
        })

        expect(result.current.marketsProxyFeature.enabled).toBe(true)
    })

    it("should return feature flags disabled if app version is lower than the minimum version", () => {
        ;(DeviceInfo.getVersion as jest.Mock).mockReturnValue("2.2.9")
        const { result, waitFor } = renderHook(() => useFeatureFlags(), {
            wrapper: createWrapper,
        })

        waitFor(
            () => {
                expect(result.current.betterWorldFeature.appsScreen.enabled).toBe(false)
            },
            { timeout: 10000 },
        )
    })

    it("should return feature flags enabled if app version is higher than the minimum version", () => {
        ;(DeviceInfo.getVersion as jest.Mock).mockReturnValue("2.5.0")
        const { result, waitFor } = renderHook(() => useFeatureFlags(), {
            wrapper: createWrapper,
        })

        waitFor(
            () => {
                expect(result.current.betterWorldFeature.appsScreen.enabled).toBe(true)
            },
            { timeout: 10000 },
        )
    })
})
