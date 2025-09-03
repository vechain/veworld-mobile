import { renderHook } from "@testing-library/react-hooks"
import { act } from "@testing-library/react-native"
import { captureRef } from "react-native-view-shot"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { TestWrapper } from "~Test"
import { useBrowserScreenshot } from "./useBrowserScreenshot"

jest.mock("react-native-view-shot")
jest.mock("expo-file-system", () => ({
    documentDirectory: "/test/directory/",
    getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
    makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
    deleteAsync: jest.fn().mockResolvedValue(undefined),
    copyAsync: jest.fn().mockResolvedValue(undefined),
}))

const updateTab = jest.fn().mockImplementation(payload => ({ type: "discovery/updateTab", payload }))
const updateLastVisitedUrl = jest.fn().mockImplementation(payload => ({ type: "discovery/updateLastVisitedUrl", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    updateTab: (...args: any[]) => updateTab(...args),
    updateLastVisitedUrl: (...args: any[]) => updateLastVisitedUrl(...args),
}))

jest.mock("~Components/Providers/InAppBrowserProvider")

describe("useBrowserScreenshot", () => {
    beforeEach(() => {
        updateTab.mockClear()
        updateLastVisitedUrl.mockClear()
    })

    it("should be able to perform a screenshot and update tab with file path", async () => {
        ;(captureRef as jest.Mock).mockReturnValue("/tmp/screenshot.jpg")
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

        // Wait for the setTimeout to execute
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
        })

        expect(updateTab).toHaveBeenCalledWith({
            id: "TEST_ID",
            previewPath: "/test/directory/screenshots/TEST_ID-preview.jpg",
            favicon: "https://vechain.org/favicon.ico",
        })
    })

    it("should set the title if it is not a dapp", async () => {
        ;(captureRef as jest.Mock).mockReturnValue("/tmp/screenshot.jpg")
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

        // Wait for the setTimeout to execute
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
        })

        expect(updateTab).toHaveBeenCalledWith({
            id: "TEST_ID",
            previewPath: "/test/directory/screenshots/TEST_ID-preview.jpg",
            title: "NAV STATE TITLE",
            favicon:
                // eslint-disable-next-line max-len
                "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=48&&url=https://vechain.org",
        })
    })
})
