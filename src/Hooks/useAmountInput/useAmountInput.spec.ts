import { renderHook, act } from "@testing-library/react-hooks"
import { useAmountInput } from "./useAmountInput"
import { useLocale } from "../useLocale"

jest.mock("../useLocale")

describe("useAmountInput", () => {
    const mockLocale = { decimalSeparator: "." }

    beforeEach(() => {
        ;(useLocale as jest.Mock).mockReturnValue(mockLocale)
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
            const input = result.current.removeInvalidCharacters("1a2b3c")
            result.current.setInput(input)
        })

        expect(result.current.input).toEqual("123")
    })

    it("should filter out duplicate decimal separators from input value", () => {
        const { result } = renderHook(() => useAmountInput())

        act(() => {
            const input = result.current.removeInvalidCharacters("1.2.3")
            result.current.setInput(input)
        })

        expect(result.current.input).toEqual("12.3")
    })
})
