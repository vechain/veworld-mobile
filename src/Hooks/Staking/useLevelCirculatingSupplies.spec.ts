import { renderHook } from "@testing-library/react-hooks"

import { TestWrapper } from "~Test"

import { useLevelCirculatingSupplies } from "./useLevelCirculatingSupplies"
import { useStargateConfig } from "~Hooks/useStargateConfig"

jest.mock("~Hooks/useThorClient", () => ({
    useMainnetThorClient: jest.fn().mockReturnValue({
        contracts: {
            load: jest.fn().mockReturnValue({
                read: {
                    getLevelsCirculatingSupplies: jest
                        .fn()
                        .mockResolvedValue([25n, 20n, 15n, 10n, 5n, 3n, 10n, 15n, 20n, 25n]),
                },
            }),
        },
    }),
}))

jest.mock("~Hooks/useStargateConfig", () => ({
    useStargateConfig: jest.fn().mockReturnValue({
        STARGATE_NFT_CONTRACT_ADDRESS: "0x1856c533ac2d94340aaa8544d35a5c1d4a21dee7",
        NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB",
        LEGACY_NODES_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302",
        STARGATE_DELEGATION_CONTRACT_ADDRESS: "0x4cb1c9ef05b529c093371264fab2c93cc6cddb0e",
    }),
}))

describe("useLevelCirculatingSupplies", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return the level circulating supplies", async () => {
        const { result, waitFor } = renderHook(() => useLevelCirculatingSupplies(), { wrapper: TestWrapper })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data).toEqual([25, 20, 15, 10, 5, 3, 10, 15, 20, 25])
        })
    })

    it("should not return anything if the NFT contract address is not defined", async () => {
        ;(useStargateConfig as jest.Mock).mockReturnValue({})
        const { result, waitFor } = renderHook(() => useLevelCirculatingSupplies(), { wrapper: TestWrapper })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.data).toBeUndefined()
        })
    })
})
