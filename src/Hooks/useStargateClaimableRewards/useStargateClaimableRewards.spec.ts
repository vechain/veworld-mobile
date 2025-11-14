import { renderHook } from "@testing-library/react-hooks"
import { ThorClient } from "@vechain/sdk-network"

import { TestWrapper } from "~Test"

import { useStargateConfig } from "~Hooks/useStargateConfig"

import { useStargateClaimableRewards } from "./useStargateClaimableRewards"
import { ethers } from "ethers"

const executeMultipleClausesCall = jest.fn()

jest.mock("~Hooks/useStargateConfig", () => ({ useStargateConfig: jest.fn() }))
jest.mock("~Utils/ThorUtils", () => ({
    clause: {
        executeMultipleClausesCall: (...args: any[]) => executeMultipleClausesCall(...args),
        getContractClauseOfMethod: jest.requireActual("~Utils/ThorUtils").default.clause.getContractClauseOfMethod,
        assertMultipleClausesCallSuccess:
            jest.requireActual("~Utils/ThorUtils").default.clause.assertMultipleClausesCallSuccess,
    },
}))

describe("useStargateClaimableRewards", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should get hayabusa rewards if hayabusa", async () => {
        const contractAddress = ethers.Wallet.createRandom().address

        ;(useStargateConfig as jest.Mock).mockReturnValue({ STARGATE_CONTRACT_ADDRESS: contractAddress })
        executeMultipleClausesCall.mockResolvedValue([{ success: true, result: { plain: 1n } }])

        const { result, waitFor } = renderHook(() => useStargateClaimableRewards({ nodeId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe("1")
        })

        expect(executeMultipleClausesCall).toHaveBeenCalledWith(
            expect.any(ThorClient),
            expect.objectContaining({
                clause: {
                    data: "0x9835fc7e0000000000000000000000000000000000000000000000000000000000000001",
                    to: contractAddress.toLowerCase(),
                    value: "0x0",
                },
            }),
        )
    })
    it("should get legacy rewards if legacy", async () => {
        const delegationAddress = ethers.Wallet.createRandom().address
        const nftAddress = ethers.Wallet.createRandom().address
        ;(useStargateConfig as jest.Mock).mockReturnValue({
            STARGATE_DELEGATION_CONTRACT_ADDRESS: delegationAddress,
            STARGATE_NFT_CONTRACT_ADDRESS: nftAddress,
        })
        executeMultipleClausesCall.mockResolvedValue([
            { success: true, result: { plain: 1n } },
            { success: true, result: { plain: 2n } },
        ])

        const { result, waitFor } = renderHook(() => useStargateClaimableRewards({ nodeId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe("3")
        })

        expect(executeMultipleClausesCall).toHaveBeenCalledWith(
            expect.any(ThorClient),
            expect.objectContaining({
                clause: {
                    data: "0x9835fc7e0000000000000000000000000000000000000000000000000000000000000001",
                    to: delegationAddress.toLowerCase(),
                    value: "0x0",
                },
            }),
            expect.objectContaining({
                clause: {
                    data: "0xaca07dbc0000000000000000000000000000000000000000000000000000000000000001",
                    to: nftAddress.toLowerCase(),
                    value: "0x0",
                },
            }),
        )
    })
    it("should throw error if hayabusa clauses revert", async () => {
        const contractAddress = ethers.Wallet.createRandom().address

        ;(useStargateConfig as jest.Mock).mockReturnValue({ STARGATE_CONTRACT_ADDRESS: contractAddress })
        executeMultipleClausesCall.mockResolvedValue([{ success: false, result: { plain: 1n } }])

        const { result, waitFor } = renderHook(() => useStargateClaimableRewards({ nodeId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error?.message).toBe("[getStargateClaimableRewards]: Clause reverted")
        })

        expect(executeMultipleClausesCall).toHaveBeenCalledTimes(4)
        expect(executeMultipleClausesCall).toHaveBeenCalledWith(
            expect.any(ThorClient),
            expect.objectContaining({
                clause: {
                    data: "0x9835fc7e0000000000000000000000000000000000000000000000000000000000000001",
                    to: contractAddress.toLowerCase(),
                    value: "0x0",
                },
            }),
        )
    })
    it("should throw error if any of legacy clauses revert", async () => {
        const delegationAddress = ethers.Wallet.createRandom().address
        const nftAddress = ethers.Wallet.createRandom().address
        ;(useStargateConfig as jest.Mock).mockReturnValue({
            STARGATE_DELEGATION_CONTRACT_ADDRESS: delegationAddress,
            STARGATE_NFT_CONTRACT_ADDRESS: nftAddress,
        })
        executeMultipleClausesCall.mockResolvedValue([
            { success: true, result: { plain: 1n } },
            { success: false, result: { plain: 2n } },
        ])

        const { result, waitFor } = renderHook(() => useStargateClaimableRewards({ nodeId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.error?.message).toBe("[getStargateClaimableRewards]: Clause reverted")
            },
            { timeout: 10000 },
        )

        expect(executeMultipleClausesCall).toHaveBeenCalledTimes(4)
        expect(executeMultipleClausesCall).toHaveBeenCalledWith(
            expect.any(ThorClient),
            expect.objectContaining({
                clause: {
                    data: "0x9835fc7e0000000000000000000000000000000000000000000000000000000000000001",
                    to: delegationAddress.toLowerCase(),
                    value: "0x0",
                },
            }),
            expect.objectContaining({
                clause: {
                    data: "0xaca07dbc0000000000000000000000000000000000000000000000000000000000000001",
                    to: nftAddress.toLowerCase(),
                    value: "0x0",
                },
            }),
        )
    }, 15000)
})
