import { useNavigation } from "@react-navigation/native"
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"

import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { Routes } from "~Navigation"

import { URLBar } from "./URLBar"

jest.mock("~Components/Providers/InAppBrowserProvider")

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

        render(<URLBar navigationUrl="https://vechain.org" isLoading={false} />, {
            wrapper: TestWrapper,
        })

        const urlInput = await screen.findByTestId("URL-bar-website-name")

        expect(urlInput).toBeVisible()
    })

    it("should navigate to apps search", async () => {
        const replaceFn = jest.fn()
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            showToolbars: true,
            isDapp: false,
            navigationState: {
                url: "https://vechain.org",
            },
        })
        ;(useNavigation as jest.Mock).mockReturnValue({
            replace: replaceFn,
        })
        render(<URLBar navigationUrl="https://vechain.org" isLoading={false} />, {
            wrapper: TestWrapper,
        })

        const urlInput = await screen.getByTestId("URL-bar-website-name")
        fireEvent.press(urlInput)

        await waitFor(() => {
            expect(replaceFn).toHaveBeenCalledWith(Routes.APPS_SEARCH)
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
                { wrapper: TestWrapper },
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
            ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateFn })

            render(<URLBar navigationUrl="https://vechain.org" isLoading={false} onNavigate={onNavigateFn} />, {
                wrapper: ({ children }) => TestWrapper({ children, preloadedState }),
            })

            const backButton = await screen.getByTestId("URL-bar-back-button")
            fireEvent.press(backButton)

            await waitFor(() => {
                expect(onNavigateFn).toHaveBeenCalled()
                expect(navigateFn).toHaveBeenCalledWith(Routes.HOME)
            })
        })

        it("should navigate to Routes.APPS when lastNavigationSource", async () => {
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
            ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateFn })

            render(<URLBar navigationUrl="https://vechain.org" isLoading={false} onNavigate={onNavigateFn} />, {
                wrapper: ({ children }) => TestWrapper({ children, preloadedState }),
            })

            const backButton = await screen.getByTestId("URL-bar-back-button")
            fireEvent.press(backButton)

            await waitFor(() => {
                expect(onNavigateFn).toHaveBeenCalled()
                expect(navigateFn).toHaveBeenCalledWith(Routes.APPS)
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
            ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateFn })

            render(<URLBar navigationUrl="https://vechain.org" isLoading={false} onNavigate={onNavigateFn} />, {
                wrapper: ({ children }) => TestWrapper({ children, preloadedState }),
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
            ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateFn })

            render(<URLBar navigationUrl="https://vechain.org" isLoading={false} returnScreen={Routes.HOME} />, {
                wrapper: TestWrapper,
            })

            const backButton = await screen.getByTestId("URL-bar-back-button")
            fireEvent.press(backButton)

            await waitFor(() => {
                expect(navigateFn).toHaveBeenCalledWith(Routes.HOME)
            })
        })
    })
})
