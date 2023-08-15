import { renderHook } from "@testing-library/react-hooks"
import { useRenameWallet } from "~Hooks"
import { TestHelpers, TestWrapper } from "~Test"

const { device1 } = TestHelpers.data

describe("useRenameWallet", () => {
    it("should render correctly", async () => {
        const { result } = renderHook(() => useRenameWallet(device1), {
            wrapper: TestWrapper,
        })

        expect(result.current).toBeDefined()

        result.current.changeDeviceAlias({ newAlias: "newAlias" })
    })
})
