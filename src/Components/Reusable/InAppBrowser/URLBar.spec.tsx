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
    smartWalletFeature: {
        enabled: false,
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
        balanceScreen: {
            enabled: false,
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

        render(<URLBar navigationUrl="https://vechain.org" isLoading={false} />, {
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
        render(<URLBar navigationUrl="https://vechain.org" isLoading={false} />, {
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
        render(<URLBar navigationUrl="https://vechain.org" isLoading={false} />, {
            wrapper: createWrapper(),
        })

        const urlInput = await screen.getByTestId("URL-bar-website-name")
        fireEvent.press(urlInput)

        await waitFor(() => {
            expect(replaceFn).toHaveBeenCalledWith(Routes.DISCOVER_SEARCH)
        })
    })

    describe("navToDiscover (back navigation)", () => {
        it("should call onNavigate and navigate to returnScreen when returnScreen prop is provided", async () => {
            const navigateFn = jest.fn()
            const onNavigateFn = jest.fn().mockResolvedValue(undefined)
            ;(useInAppBrowser as jest.Mock).mockReturnValue({
                showToolbars: true,
                isDapp: false,
                navigationState: {
                    url: "https://vechain.org",
                },
            })
            ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
            ;(useNavigation as jest.Mock).mockReturnValue({
                navigate: navigateFn,
            })

            render(
                <URLBar
                    navigationUrl="https://vechain.org"
                    isLoading={false}
                    onNavigate={onNavigateFn}
                    returnScreen={Routes.SETTINGS}
                />,
                { wrapper: createWrapper() },
            )

            const backButton = await screen.getByTestId("URL-bar-back-button")
            fireEvent.press(backButton)

            await waitFor(() => {
                expect(onNavigateFn).toHaveBeenCalled()
                expect(navigateFn).toHaveBeenCalledWith(Routes.SETTINGS)
            })
        })

        it("should navigate to lastNavigationSource when available and valid", async () => {
            const navigateFn = jest.fn()
            const onNavigateFn = jest.fn().mockResolvedValue(undefined)
            const preloadedState = {
                discovery: {
                    lastNavigationSource: Routes.HOME,
                    favorites: [],
                    featured: [],
                    custom: [],
                    hasOpenedDiscovery: false,
                    connectedApps: [],
                    tabsManager: { currentTabId: null, tabs: [] },
                    bannerInteractions: {},
                    isNormalUser: false,
                },
            }

            ;(useInAppBrowser as jest.Mock).mockReturnValue({
                showToolbars: true,
                isDapp: false,
                navigationState: { url: "https://vechain.org" },
            })
            ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
            ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateFn })

            render(<URLBar navigationUrl="https://vechain.org" isLoading={false} onNavigate={onNavigateFn} />, {
                wrapper: ({ children }) => createWrapper()({ children, preloadedState }),
            })

            const backButton = await screen.getByTestId("URL-bar-back-button")
            fireEvent.press(backButton)

            await waitFor(() => {
                expect(onNavigateFn).toHaveBeenCalled()
                expect(navigateFn).toHaveBeenCalledWith(Routes.HOME)
            })
        })

        it("should navigate to Routes.APPS when appsScreen enabled and no lastNavigationSource", async () => {
            const navigateFn = jest.fn()
            const onNavigateFn = jest.fn().mockResolvedValue(undefined)
            const preloadedState = {
                discovery: {
                    favorites: [],
                    featured: [],
                    custom: [],
                    hasOpenedDiscovery: false,
                    connectedApps: [],
                    tabsManager: { currentTabId: null, tabs: [] },
                    bannerInteractions: {},
                    isNormalUser: false,
                },
            }

            ;(useInAppBrowser as jest.Mock).mockReturnValue({
                showToolbars: true,
                isDapp: false,
                navigationState: { url: "https://vechain.org" },
            })
            ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
            ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateFn })

            render(<URLBar navigationUrl="https://vechain.org" isLoading={false} onNavigate={onNavigateFn} />, {
                wrapper: ({ children }) => createWrapper()({ children, preloadedState }),
            })

            const backButton = await screen.getByTestId("URL-bar-back-button")
            fireEvent.press(backButton)

            await waitFor(() => {
                expect(onNavigateFn).toHaveBeenCalled()
                expect(navigateFn).toHaveBeenCalledWith(Routes.APPS)
            })
        })

        it("should navigate to Routes.DISCOVER when appsScreen disabled", async () => {
            const navigateFn = jest.fn()
            const onNavigateFn = jest.fn().mockResolvedValue(undefined)
            const preloadedState = {
                discovery: {
                    favorites: [],
                    featured: [],
                    custom: [],
                    hasOpenedDiscovery: false,
                    connectedApps: [],
                    tabsManager: { currentTabId: null, tabs: [] },
                    bannerInteractions: {},
                    isNormalUser: false,
                },
            }

            ;(useInAppBrowser as jest.Mock).mockReturnValue({
                showToolbars: true,
                isDapp: false,
                navigationState: { url: "https://vechain.org" },
            })
            ;(useFeatureFlags as jest.Mock).mockReturnValue({
                ...mockedFeatureFlags,
                betterWorldFeature: {
                    ...mockedFeatureFlags.betterWorldFeature,
                    appsScreen: { enabled: false },
                },
            })
            ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateFn })

            render(<URLBar navigationUrl="https://vechain.org" isLoading={false} onNavigate={onNavigateFn} />, {
                wrapper: ({ children }) => createWrapper()({ children, preloadedState }),
            })

            const backButton = await screen.getByTestId("URL-bar-back-button")
            fireEvent.press(backButton)

            await waitFor(() => {
                expect(onNavigateFn).toHaveBeenCalled()
                expect(navigateFn).toHaveBeenCalledWith(Routes.DISCOVER)
            })
        })

        it("should ignore invalid lastNavigationSource and fallback to default", async () => {
            const navigateFn = jest.fn()
            const onNavigateFn = jest.fn().mockResolvedValue(undefined)
            const preloadedState = {
                discovery: {
                    lastNavigationSource: "INVALID_ROUTE",
                    favorites: [],
                    featured: [],
                    custom: [],
                    hasOpenedDiscovery: false,
                    connectedApps: [],
                    tabsManager: { currentTabId: null, tabs: [] },
                    bannerInteractions: {},
                    isNormalUser: false,
                },
            }

            ;(useInAppBrowser as jest.Mock).mockReturnValue({
                showToolbars: true,
                isDapp: false,
                navigationState: { url: "https://vechain.org" },
            })
            ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
            ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateFn })

            render(<URLBar navigationUrl="https://vechain.org" isLoading={false} onNavigate={onNavigateFn} />, {
                wrapper: ({ children }) => createWrapper()({ children, preloadedState }),
            })

            const backButton = await screen.getByTestId("URL-bar-back-button")
            fireEvent.press(backButton)

            await waitFor(() => {
                expect(onNavigateFn).toHaveBeenCalled()
                expect(navigateFn).toHaveBeenCalledWith(Routes.APPS)
            })
        })

        it("should work without onNavigate callback", async () => {
            const navigateFn = jest.fn()

            ;(useInAppBrowser as jest.Mock).mockReturnValue({
                showToolbars: true,
                isDapp: false,
                navigationState: { url: "https://vechain.org" },
            })
            ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
            ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateFn })

            render(<URLBar navigationUrl="https://vechain.org" isLoading={false} returnScreen={Routes.HOME} />, {
                wrapper: createWrapper(),
            })

            const backButton = await screen.getByTestId("URL-bar-back-button")
            fireEvent.press(backButton)

            await waitFor(() => {
                expect(navigateFn).toHaveBeenCalledWith(Routes.HOME)
            })
        })
    })
})
