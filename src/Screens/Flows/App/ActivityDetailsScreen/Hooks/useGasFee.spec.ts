import { renderHook } from "@testing-library/react-hooks"
import { useGasFee } from "./useGasFee"
import { TestWrapper } from "~Test"
import { ethers } from "ethers"

describe("useGasFee", () => {
    it("should render correctly", () => {
        const { result } = renderHook(() => useGasFee(ethers.utils.parseEther("2.2").toHexString()), {
            wrapper: TestWrapper,
        })

        expect(result.current.vthoGasFee).toBe("2.2")
    })
})
