/* eslint-disable max-len */
import { renderHook } from "@testing-library/react-hooks"
import { AppStateType } from "~Model"
import { useAppStateTransitions } from "./useAppStateTransitions"
import { useAppState } from "../useAppState"

jest.mock("../useAppState")

describe("useAppStateTransitions", () => {
    const mockUseAppState = useAppState as jest.MockedFunction<typeof useAppState>

    beforeEach(() => {
        mockUseAppState.mockReturnValue({
            previousState: AppStateType.ACTIVE,
            currentState: AppStateType.ACTIVE,
        })
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it("should return false for all transitions if the previous state and current state are both 'active'", () => {
        const { result } = renderHook(() => useAppStateTransitions())

        expect(result.current.activeToBackground).toBe(false)
        expect(result.current.backgroundToActive).toBe(false)
        expect(result.current.closedToActive).toBe(false)
    })

    it("should return true for 'activeToBackground' transition when the previous state was 'active' and current state is 'background'", () => {
        mockUseAppState.mockReturnValueOnce({
            previousState: AppStateType.ACTIVE,
            currentState: AppStateType.BACKGROUND,
        })

        const { result } = renderHook(() => useAppStateTransitions())

        expect(result.current.activeToBackground).toBe(true)
        expect(result.current.backgroundToActive).toBe(false)
        expect(result.current.closedToActive).toBe(false)
    })

    it("should return true for 'backgroundToActive' transition when the previous state was 'background' and current state is 'active'", () => {
        mockUseAppState.mockReturnValueOnce({
            previousState: AppStateType.BACKGROUND,
            currentState: AppStateType.ACTIVE,
        })

        const { result } = renderHook(() => useAppStateTransitions())

        expect(result.current.activeToBackground).toBe(false)
        expect(result.current.backgroundToActive).toBe(true)
        expect(result.current.closedToActive).toBe(false)
    })

    it("should return true for 'closedToActive' transition when the previous state was 'unknown' and current state is 'active'", () => {
        mockUseAppState.mockReturnValueOnce({
            previousState: AppStateType.UNKNOWN,
            currentState: AppStateType.ACTIVE,
        })

        const { result } = renderHook(() => useAppStateTransitions())

        expect(result.current.activeToBackground).toBe(false)
        expect(result.current.backgroundToActive).toBe(false)
        expect(result.current.closedToActive).toBe(true)
    })
})
