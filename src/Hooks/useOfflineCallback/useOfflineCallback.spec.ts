import { renderHook, act } from "@testing-library/react-hooks"
import { useNetInfo } from "@react-native-community/netinfo"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { useOfflineCallback } from "./useOfflineCallback"

jest.mock("@react-native-community/netinfo", () => ({
    useNetInfo: jest.fn(),
}))

jest.mock("~Components/Providers/FeedbackProvider/Events", () => ({
    Feedback: {
        show: jest.fn(),
    },
}))

jest.mock("~i18n", () => ({
    useI18nContext: () => ({
        LL: {
            OFFLINE_CHIP: () => "You are offline",
        },
    }),
}))

const mockUseNetInfo = useNetInfo as jest.Mock

describe("useOfflineCallback", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should execute callback when online", () => {
        mockUseNetInfo.mockReturnValue({ isConnected: true, isInternetReachable: true })

        const callback = jest.fn().mockReturnValue("result")
        const { result } = renderHook(() => useOfflineCallback(callback))

        act(() => {
            const returnValue = result.current("arg1", "arg2")
            expect(returnValue).toBe("result")
        })

        expect(callback).toHaveBeenCalledWith("arg1", "arg2")
        expect(Feedback.show).not.toHaveBeenCalled()
    })

    it("should block callback and show feedback when offline", () => {
        mockUseNetInfo.mockReturnValue({ isConnected: false, isInternetReachable: false })

        const callback = jest.fn()
        const { result } = renderHook(() => useOfflineCallback(callback))

        act(() => {
            const returnValue = result.current()
            expect(returnValue).toBeUndefined()
        })

        expect(callback).not.toHaveBeenCalled()
        expect(Feedback.show).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "You are offline",
                severity: "error",
                type: "alert",
            }),
        )
    })

    it("should treat null network state as online", () => {
        mockUseNetInfo.mockReturnValue({ isConnected: null, isInternetReachable: null })

        const callback = jest.fn()
        const { result } = renderHook(() => useOfflineCallback(callback))

        act(() => {
            result.current()
        })

        expect(callback).toHaveBeenCalled()
        expect(Feedback.show).not.toHaveBeenCalled()
    })
})
