import { renderHook } from "@testing-library/react-hooks"
import { usePrevious } from "./usePrevious"

describe("usePrevious", () => {
    it("should return undefined on initial render", () => {
        const { result } = renderHook(() => usePrevious("test"))

        expect(result.current).toBeUndefined()
    })

    it("should return the previous value of the argument", () => {
        const { result, rerender } = renderHook(props => usePrevious(props), {
            initialProps: "first",
        })

        expect(result.current).toBeUndefined()

        rerender("second")

        expect(result.current).toBe("first")

        rerender("third")
        rerender("fourth")

        expect(result.current).toBe("third")
    })
})
