import { TestWrapper, TestHelpers } from "~Test"
import { useGetVeDelegateBalance } from "./useGetVeDelegateBalance"
import { renderHook } from "@testing-library/react-hooks"

const { account1D1 } = TestHelpers.data

describe("useGetVeDelegateBalance", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render", async () => {
        const { result, waitForValueToChange } = renderHook(() => useGetVeDelegateBalance(account1D1.address), {
            wrapper: TestWrapper,
        })

        await waitForValueToChange(() => result.current.isLoading)

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeDefined()

        expect(result.current.data?.original).toBe("0x9184e72a000")
        expect(result.current.data?.scaled).toBe("0.00001")
    })
})
