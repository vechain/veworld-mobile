import { renderHook, act } from "@testing-library/react-hooks"
import { useAmountInput } from "./useAmountInput"
import { useDecimalSeparator } from "../useDecimalSeparator"

jest.mock("../useDecimalSeparator")

describe("useAmountInput", () => {
    const mockDecimalSeparator = "."

    beforeEach(() => {
        ;(useDecimalSeparator as jest.Mock).mockReturnValue(
            mockDecimalSeparator,
        )
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it("should set input value correctly when input is valid", () => {
        const initialValue = "1"
        const { result } = renderHook(() => useAmountInput(initialValue))

        act(() => {
            result.current.setInput("1.23")
        })

        expect(result.current.input).toEqual("1.23")
    })

    it("should filter out invalid characters from input value", () => {
        const { result } = renderHook(() => useAmountInput())

        act(() => {
            result.current.setInput("1a2b3c")
        })

        expect(result.current.input).toEqual("123")
    })

    it("should filter out duplicate decimal separators from input value", () => {
        const { result } = renderHook(() => useAmountInput())

        act(() => {
            result.current.setInput("1.2.3")
        })

        expect(result.current.input).toEqual("12.3")
    })
})
