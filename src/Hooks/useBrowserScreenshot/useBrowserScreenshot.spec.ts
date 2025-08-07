import { renderHook } from "@testing-library/react-hooks"
import { act } from "@testing-library/react-native"
import { captureRef } from "react-native-view-shot"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { TestWrapper } from "~Test"
import { useBrowserScreenshot } from "./useBrowserScreenshot"

jest.mock("react-native-view-shot")

const updateTab = jest.fn().mockImplementation(payload => ({ type: "discovery/updateTab", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    updateTab: (...args: any[]) => updateTab(...args),
}))

jest.mock("~Components/Providers/InAppBrowserProvider")

describe("useBrowserScreenshot", () => {
    it("should be able to perform a screenshot and update tab with uri", async () => {
        ;(captureRef as jest.Mock).mockReturnValue("URI")
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            isDapp: true,
            dappMetadata: {
                name: "VeChain",
                icon: "https://vechain.org/favicon.ico",
                url: "https://vechain.org",
            },
            navigationState: {
                url: "https://vechain.org",
            },
        })
        const { result } = renderHook(() => useBrowserScreenshot(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        bannerInteractions: {},
                        connectedApps: [],
                        custom: [],
                        favorites: [],
                        featured: [],
                        hasOpenedDiscovery: false,
                        tabsManager: {
                            currentTabId: "TEST_ID",
                            tabs: [
                                {
                                    href: "https://vechain.org",
                                    id: "TEST_ID",
                                    title: "TEST",
                                    favicon: "https://vechain.org/favicon.ico",
                                },
                            ],
                        },
                    },
                },
            },
        })

        await act(async () => {
            Object.defineProperty(result.current.ref, "current", {
                get: jest.fn(() => "TEST"),
                set: jest.fn(() => "TEST"),
            })
            await result.current.performScreenshot()
        })

        expect(updateTab).toHaveBeenCalledWith({
            id: "TEST_ID",
            preview: "URI",
            favicon: "https://vechain.org/favicon.ico",
        })
    })

    it("should set the title if it is not a dapp", async () => {
        ;(captureRef as jest.Mock).mockReturnValue("URI")
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            isDapp: false,
            dappMetadata: undefined,
            navigationState: {
                url: "https://vechain.org",
                title: "NAV STATE TITLE",
            },
        })
        const { result } = renderHook(() => useBrowserScreenshot(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        bannerInteractions: {},
                        connectedApps: [],
                        custom: [],
                        favorites: [],
                        featured: [],
                        hasOpenedDiscovery: false,
                        tabsManager: {
                            currentTabId: "TEST_ID",
                            tabs: [
                                {
                                    href: "https://vechain.org",
                                    id: "TEST_ID",
                                    title: "TEST",
                                    favicon:
                                        // eslint-disable-next-line max-len
                                        "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=48&&url=https://vechain.org",
                                },
                            ],
                        },
                    },
                },
            },
        })

        await act(async () => {
            Object.defineProperty(result.current.ref, "current", {
                get: jest.fn(() => "TEST"),
                set: jest.fn(() => "TEST"),
            })
            await result.current.performScreenshot()
        })

        expect(updateTab).toHaveBeenCalledWith({
            id: "TEST_ID",
            preview: "URI",
            title: "NAV STATE TITLE",
            favicon:
                // eslint-disable-next-line max-len
                "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=48&&url=https://vechain.org",
        })
    })
})
