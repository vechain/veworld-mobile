import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BannersCarousel } from "./BannersCarousel"
import { TestWrapper } from "~Test"
import { RootState } from "~Storage/Redux/Types"
import { CURRENCY, CURRENCY_FORMATS, SYMBOL_POSITIONS, ThemeEnum } from "~Constants"
import { FeatureFlagsProvider } from "~Components"

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
    },
}

describe("BannersCarousel", () => {
    it("should render correctly", () => {
        const { getByTestId } = render(<BannersCarousel location="home_screen" />, {
            wrapper: createWrapper(mockedState),
        })
        expect(getByTestId("home_screen_carousel")).toBeOnTheScreen()
    })

    it("should not render Stargate banner if showStargateBanner is false", () => {
        render(<BannersCarousel location="home_screen" />, {
            wrapper: createWrapper({
                ...mockedState,
                userPreferences: {
                    ...mockedState.userPreferences!,
                    hideStargateBannerHomeScreen: true,
                },
            }),
        })
        expect(screen.queryByTestId("home_screen_carousel")).not.toBeTruthy()
    })
})
