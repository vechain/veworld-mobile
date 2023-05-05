import { renderHook } from "@testing-library/react-hooks/native"
import { getLocales } from "expo-localization"
import { useDecimalSeparator } from "./useDecimalSeparator"

describe("useDecimalSeparator", () => {
    it("should return the decimal separator from the user's device locale", () => {
        const decimalSeparator = ","
        ;(getLocales as jest.Mock).mockReturnValueOnce([{ decimalSeparator }])

        const { result } = renderHook(() => useDecimalSeparator())

        expect(result.current).toEqual(decimalSeparator)
    })
})
