import React from "react"
import { TestWrapper } from "~Test"
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { URLBar } from "./URLBar"
import { RootState } from "~Storage/Redux/Types"
import { Routes } from "~Navigation"
import { useFeatureFlags, FeatureFlagsProvider } from "~Components/Providers/FeatureFlagsProvider"
import { FeatureFlags } from "~Api/FeatureFlags"
import { useNavigation } from "@react-navigation/native"

jest.mock("~Components/Providers/InAppBrowserProvider")

const createWrapper = () => {
    return ({ children, preloadedState }: { children: React.ReactNode; preloadedState: Partial<RootState> }) => {
        return (
            <TestWrapper preloadedState={preloadedState}>
                <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
            </TestWrapper>
        )
    }
}

const mockedFeatureFlags: FeatureFlags = {
    marketsProxyFeature: {
        enabled: true,
        url: "https://coin-api.veworld.vechain.org",
        fallbackUrl: "https://api.coingecko.com/api/v3",
    },
    pushNotificationFeature: {
        enabled: true,
    },
    subdomainClaimFeature: {
        enabled: true,
    },
    paymentProvidersFeature: {
        "coinbase-pay": {
            android: true,
            iOS: false,
        },
        transak: {
            android: true,
            iOS: true,
        },
        coinify: {
            android: true,
            iOS: false,
        },
    },
    discoveryFeature: {
        bannersAutoplay: true,
        showStellaPayBanner: false,
        showStargateBanner: true,
    },
    forks: {
        GALACTICA: {
            transactions: {
                ledger: false,
            },
        },
    },
    betterWorldFeature: {
        appsScreen: {
            enabled: true,
        },
    },
}

jest.mock("~Components/Providers/FeatureFlagsProvider", () => ({
    ...jest.requireActual("~Components/Providers/FeatureFlagsProvider"),
    useFeatureFlags: jest.fn(),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
}))

describe("URLBar", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })

    it("should render correctly", async () => {
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            showToolbars: true,
            isDapp: false,
            dappMetadata: undefined,
            navigationState: {
                url: "https://vechain.org",
            },
        })
        ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)

        render(<URLBar isLoading={false} />, {
            wrapper: createWrapper(),
        })

        screen.debug()

        const urlInput = await screen.findByTestId("URL-bar-website-name")

        expect(urlInput).toBeVisible()
    })

    it("should navigate to apps search if betterWorldFeature.appsScreen.enabled is true", async () => {
        const replaceFn = jest.fn()
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            showToolbars: true,
            isDapp: false,
            navigationState: {
                url: "https://vechain.org",
            },
        })
        ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
        ;(useNavigation as jest.Mock).mockReturnValue({
            replace: replaceFn,
        })
        render(<URLBar isLoading={false} />, {
            wrapper: createWrapper(),
        })

        const urlInput = await screen.getByTestId("URL-bar-website-name")
        fireEvent.press(urlInput)

        await waitFor(() => {
            expect(replaceFn).toHaveBeenCalledWith(Routes.APPS_SEARCH)
        })
    })

    it("should navigate to discover search if betterWorldFeature.appsScreen.enabled is false", async () => {
        const replaceFn = jest.fn()
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            showToolbars: true,
            isDapp: false,
            navigationState: {
                url: "https://vechain.org",
            },
        })
        ;(useFeatureFlags as jest.Mock).mockReturnValue({
            ...mockedFeatureFlags,
            betterWorldFeature: {
                ...mockedFeatureFlags.betterWorldFeature,
                appsScreen: { ...mockedFeatureFlags.betterWorldFeature.appsScreen, enabled: false },
            },
        })
        ;(useNavigation as jest.Mock).mockReturnValue({
            replace: replaceFn,
        })
        render(<URLBar isLoading={false} />, {
            wrapper: createWrapper(),
        })

        const urlInput = await screen.getByTestId("URL-bar-website-name")
        fireEvent.press(urlInput)

        await waitFor(() => {
            expect(replaceFn).toHaveBeenCalledWith(Routes.DISCOVER_SEARCH)
        })
    })
})
