import { act, renderHook } from "@testing-library/react-hooks"
import { useAppState } from "./useAppState"
import { AppState, AppStateStatus } from "react-native"

describe("useAppState", () => {
    it("should return the initial app state as 'active'", () => {
        let addEventListener: (state: AppStateStatus) => void = () => {}
        jest.spyOn(AppState, "addEventListener").mockImplementationOnce(
            (event, handler) => {
                addEventListener = handler
                return { remove: jest.fn() }
            },
        )
        const { result } = renderHook(() => useAppState())

        expect(result.current.previousState).toBe("unknown")
        expect(result.current.currentState).toBe("active")
        act(() => addEventListener("background"))
        expect(result.current.currentState).toBe("background")
    })
})
