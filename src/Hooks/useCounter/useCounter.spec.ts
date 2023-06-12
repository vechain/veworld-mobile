import { renderHook, act } from "@testing-library/react-hooks"
import { useCounter } from "./useCounter"

describe("useCounter", () => {
    it("should initialize the count to zero", () => {
        const { result } = renderHook(() => useCounter())
        expect(result.current.count).toBe(0)
    })

    it("should increment the count when calling increment", () => {
        const { result } = renderHook(() => useCounter())
        act(() => {
            result.current.increment()
        })
        expect(result.current.count).toBe(1)
    })

    it("should decrement the count when calling decrement", () => {
        const { result } = renderHook(() => useCounter())
        act(() => {
            result.current.decrement()
        })
        expect(result.current.count).toBe(-1)
    })

    it("should reset the count to zero when calling reset", () => {
        const { result } = renderHook(() => useCounter())
        act(() => {
            result.current.increment()
            result.current.reset()
        })
        expect(result.current.count).toBe(0)
    })
})
