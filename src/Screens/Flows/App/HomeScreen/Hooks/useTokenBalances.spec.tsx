import { renderHook } from "@testing-library/react-hooks"
import { useTokenBalances } from "./useTokenBalances"
import { TestWrapper } from "~Test"

describe("useTokenBalances", () => {
    it("should render", () => {
        renderHook(() => useTokenBalances(), { wrapper: TestWrapper })
    })
})
