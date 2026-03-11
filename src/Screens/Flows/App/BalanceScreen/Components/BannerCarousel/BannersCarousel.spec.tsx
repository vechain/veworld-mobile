import { useRoute } from "@react-navigation/native"
import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper, TestHelpers } from "~Test"

import { FeatureFlagsProvider, useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { CURRENCY, CURRENCY_FORMATS, SYMBOL_POSITIONS, ThemeEnum } from "~Constants"
import { AmountInputMode } from "~Model"
import { Routes } from "~Navigation"
import { RootState } from "~Storage/Redux/Types"

import { BannersCarousel } from "./BannersCarousel"

const { mockedFeatureFlags } = TestHelpers.data

const createWrapper = (preloadedState: Partial<RootState>) => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestWrapper preloadedState={preloadedState}>
            <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
        </TestWrapper>
    )
}

const mockedState: Partial<RootState> = {
    userPreferences: {
        hideStargateBannerHomeScreen: false,
        hideStargateXVeBetterBanner: false,
        hideStargateBannerVETScreen: false,
        theme: ThemeEnum.DARK,
        hideTokensWithNoBalance: false,
        isPinCodeRequired: false,
        balanceVisible: true,
        currency: CURRENCY.EUR,
        currencyFormat: CURRENCY_FORMATS.SYSTEM,
        symbolPosition: SYMBOL_POSITIONS.AFTER,
        language: "en",
        isAnalyticsTrackingEnabled: false,
        isSentryTrackingEnabled: false,
        devFeaturesEnabled: false,
        lastReviewTimestamp: "0",
        lastVersionCheck: "1",
        lastNotificationReminder: 1,
        defaultAmountInputMode: AmountInputMode.FIAT,
    },
}

jest.mock("~Components/Providers/FeatureFlagsProvider", () => ({
    ...jest.requireActual("~Components/Providers/FeatureFlagsProvider"),
    useFeatureFlags: jest.fn(),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useRoute: jest.fn(),
    useNavigationState: jest.fn(),
}))

describe("BannersCarousel", () => {
    // If you need to change mock values between tests
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", () => {
        ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
        ;(useRoute as jest.Mock).mockReturnValue({
            name: Routes.HOME,
        })
        const { getByTestId } = render(<BannersCarousel location="home_screen" />, {
            wrapper: createWrapper(mockedState),
        })
        expect(getByTestId("home_screen_carousel")).toBeOnTheScreen()
    })

    it("should not render Stargate banner when feature flag is false", () => {
        // Override the mock for this specific test
        ;(useFeatureFlags as jest.Mock).mockReturnValue({
            ...mockedFeatureFlags,
            discoveryFeature: {
                ...mockedFeatureFlags.discoveryFeature,
                showStargateBanner: false,
            },
        })
        ;(useRoute as jest.Mock).mockReturnValue({
            name: Routes.HOME,
        })

        render(<BannersCarousel location="home_screen" />, {
            wrapper: createWrapper(mockedState),
        })
        expect(screen.queryByTestId("Stargate_banner")).not.toBeTruthy()
    })

    it("should render StargateXVeBetter banner when not hidden", () => {
        render(<BannersCarousel location="home_screen" />, {
            wrapper: createWrapper(mockedState),
        })

        expect(screen.queryByTestId("StargateXVbd_banner")).toBeTruthy()
    })

    it("should not render StargateXVeBetter banner when hidden", () => {
        render(<BannersCarousel location="home_screen" />, {
            wrapper: createWrapper({
                ...mockedState,
                userPreferences: {
                    ...mockedState.userPreferences!,
                    hideStargateXVeBetterBanner: true,
                },
            }),
        })

        expect(screen.queryByTestId("StargateXVbd_banner")).not.toBeTruthy()
    })
})
