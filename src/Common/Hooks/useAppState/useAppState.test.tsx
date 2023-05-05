import { renderHook } from "@testing-library/react-hooks"
import { useAppState } from "./useAppState"

describe("useAppState", () => {
    it("should return the initial app state as 'active'", () => {
        const { result } = renderHook(() => useAppState())

        expect(result.current[0]).toBe("unknown")
        expect(result.current[1]).toBe("active")
    })
})
