import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useBrowserScreenshot } from "./useBrowserScreenshot"
import { captureRef } from "react-native-view-shot"
import { act } from "@testing-library/react-native"

jest.mock("react-native-view-shot")

const updateTab = jest.fn().mockImplementation(payload => ({ type: "discovery/updateTab", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    updateTab: (...args: any[]) => updateTab(...args),
}))

describe("useBrowserScreenshot", () => {
    it("should be able to perform a screenshot and update tab with uri", async () => {
        ;(captureRef as jest.Mock).mockReturnValue("URI")
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
                            tabs: [{ href: "https://vechain.org", id: "TEST_ID", title: "TEST" }],
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

        expect(updateTab).toHaveBeenCalledWith({ id: "TEST_ID", preview: "URI" })
    })
})
