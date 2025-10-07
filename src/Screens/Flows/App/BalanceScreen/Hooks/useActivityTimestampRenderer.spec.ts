import { renderHook } from "@testing-library/react-hooks"
import { useActivityTimestampRenderer } from "./useActivityTimestampRenderer"
import { TestWrapper } from "~Test"
import moment from "moment"

describe("useActivityTimestampRenderer", () => {
    it("should render today if the value is in the same day", () => {
        const { result } = renderHook(() => useActivityTimestampRenderer(), { wrapper: TestWrapper })
        expect(result.current(moment().valueOf())).toStrictEqual(expect.stringContaining("Today"))
    })
    it("should render yesterday if the value is in the previous day", () => {
        const { result } = renderHook(() => useActivityTimestampRenderer(), { wrapper: TestWrapper })
        expect(result.current(moment().subtract(1, "day").valueOf())).toStrictEqual(
            expect.stringContaining("Yesterday"),
        )
    })
    it("should not render the year if the year difference is < 1", () => {
        const { result } = renderHook(() => useActivityTimestampRenderer(), { wrapper: TestWrapper })
        const date = moment().subtract(100, "day")
        expect(result.current(date.valueOf())).not.toStrictEqual(expect.stringContaining(date.year().toString()))
    })
    it("should render the year if the year difference is >= 1", () => {
        const { result } = renderHook(() => useActivityTimestampRenderer(), { wrapper: TestWrapper })
        const date = moment().subtract(400, "day")
        expect(result.current(date.valueOf())).toStrictEqual(expect.stringContaining(date.year().toString()))
    })
})
