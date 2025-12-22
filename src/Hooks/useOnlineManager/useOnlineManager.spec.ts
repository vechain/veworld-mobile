import { renderHook } from "@testing-library/react-hooks"
import NetInfo from "@react-native-community/netinfo"
import { onlineManager } from "@tanstack/react-query"
import { useOnlineManager } from "./useOnlineManager"

jest.mock("@react-native-community/netinfo", () => ({
    addEventListener: jest.fn(),
}))

jest.mock("@tanstack/react-query", () => ({
    onlineManager: {
        setOnline: jest.fn(),
    },
}))

const mockAddEventListener = NetInfo.addEventListener as jest.Mock

describe("useOnlineManager", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should subscribe to NetInfo events on mount", () => {
        mockAddEventListener.mockReturnValue(jest.fn())

        renderHook(() => useOnlineManager())

        expect(mockAddEventListener).toHaveBeenCalledTimes(1)
        expect(mockAddEventListener).toHaveBeenCalledWith(expect.any(Function))
    })

    it("should unsubscribe from NetInfo events on unmount", () => {
        const unsubscribe = jest.fn()
        mockAddEventListener.mockReturnValue(unsubscribe)

        const { unmount } = renderHook(() => useOnlineManager())
        unmount()

        expect(unsubscribe).toHaveBeenCalledTimes(1)
    })

    it("should set online status to true when connected and internet reachable", () => {
        mockAddEventListener.mockImplementation(callback => {
            callback({ isConnected: true, isInternetReachable: true })
            return jest.fn()
        })

        renderHook(() => useOnlineManager())

        expect(onlineManager.setOnline).toHaveBeenCalledWith(true)
    })

    it("should set online status to false when disconnected", () => {
        mockAddEventListener.mockImplementation(callback => {
            callback({ isConnected: false, isInternetReachable: false })
            return jest.fn()
        })

        renderHook(() => useOnlineManager())

        expect(onlineManager.setOnline).toHaveBeenCalledWith(false)
    })

    it("should set online status to false when internet not reachable", () => {
        mockAddEventListener.mockImplementation(callback => {
            callback({ isConnected: true, isInternetReachable: false })
            return jest.fn()
        })

        renderHook(() => useOnlineManager())

        expect(onlineManager.setOnline).toHaveBeenCalledWith(false)
    })
})
