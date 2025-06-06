import { renderHook } from "@testing-library/react-hooks"
import { act } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { useBrowserTab } from "./useBrowserTab"

const openTab = jest.fn().mockImplementation(payload => ({ type: "discovery/openTab", payload }))
const setCurrentTab = jest.fn().mockImplementation(payload => ({ type: "discovery/setCurrentTab", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    openTab: (...args: any[]) => openTab(...args),
    setCurrentTab: (...args: any[]) => setCurrentTab(...args),
}))

describe("useBrowserTab", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    it("should open a new tab", () => {
        const { result } = renderHook(() => useBrowserTab(), {
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
                        tabsManager: { currentTabId: null, tabs: [] },
                    },
                },
            },
        })
        const navigateFn = jest.fn()

        act(() => {
            result.current.navigateWithTab({
                url: "https://vechain.org",
                title: "TEST",
                navigationFn: navigateFn,
            })
        })

        expect(navigateFn).toHaveBeenCalledWith("https://vechain.org")
        expect(openTab as jest.Mock).toHaveBeenCalledWith({
            id: expect.any(String),
            href: "https://vechain.org",
            title: "TEST",
        })
        expect(setCurrentTab).not.toHaveBeenCalled()
    })

    it("should set previously created tab as current tab", () => {
        const { result } = renderHook(() => useBrowserTab(), {
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
                            currentTabId: null,
                            tabs: [{ href: "https://vechain.org", id: "TEST_ID", title: "TEST" }],
                        },
                    },
                },
            },
        })
        const navigateFn = jest.fn()

        act(() => {
            result.current.navigateWithTab({
                url: "https://vechain.org",
                title: "TEST",
                navigationFn: navigateFn,
            })
        })

        expect(navigateFn).toHaveBeenCalledWith("https://vechain.org")
        expect(openTab).not.toHaveBeenCalled()
        expect(setCurrentTab).toHaveBeenCalledWith("TEST_ID")
    })
})
