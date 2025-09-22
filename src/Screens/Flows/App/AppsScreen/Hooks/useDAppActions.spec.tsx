import { renderHook, act } from "@testing-library/react-hooks"
import { DiscoveryDApp } from "~Constants"
import { NETWORK_TYPE } from "~Model"
import { useDAppActions } from "./useDAppActions"

const mockTrack = jest.fn()
const mockDispatch = jest.fn()
const mockAddVisitedUrl = jest.fn()
const mockCheckPermissions = jest.fn().mockResolvedValue(true)
const mockNavigateWithTab = jest.fn()

jest.mock("~Hooks", () => ({
    useAnalyticTracking: () => mockTrack,
    useCameraPermissions: () => ({ checkPermissions: mockCheckPermissions }),
    useVisitedUrls: () => ({ addVisitedUrl: mockAddVisitedUrl }),
}))

jest.mock("~Hooks/useBrowserTab", () => ({
    useBrowserTab: () => ({ navigateWithTab: mockNavigateWithTab }),
}))

jest.mock("~Storage/Redux", () => ({
    addNavigationToDApp: jest.fn(payload => ({ type: "addNavigationToDApp", payload })),
    selectSelectedNetwork: jest.fn(),
    selectNotificationFeautureEnabled: jest.fn(),
    useAppDispatch: () => mockDispatch,
    useAppSelector: jest.fn(),
}))

import { useAppSelector } from "~Storage/Redux"

describe("useDAppActions", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        ;(useAppSelector as jest.Mock).mockImplementation(selector => {
            if (selector.toString().includes("selectSelectedNetwork")) {
                return { type: NETWORK_TYPE.MAIN }
            }
            return false
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should dispatch addNavigationToDApp after 1000ms timeout", async () => {
        const mockDapp: DiscoveryDApp = {
            name: "Test DApp",
            href: "https://test.com",
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: 0,
        }

        const { result } = renderHook(() => useDAppActions("test-screen"))

        await act(async () => {
            await result.current.onDAppPress(mockDapp)
        })

        expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "addNavigationToDApp" }))

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "addNavigationToDApp",
                payload: {
                    href: "https://test.com",
                    isCustom: false,
                    sourceScreen: "test-screen",
                },
            }),
        )
    })
})
