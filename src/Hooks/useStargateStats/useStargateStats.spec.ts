import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { fetchStargateRewardsDistributed, fetchStargateTotalSupply, fetchStargateTotalVetStaked } from "~Networking"
import { useLevelCirculatingSupplies } from "~Hooks/Staking"
import { useStargateStats } from "./useStargateStats"

jest.mock("~Networking", () => ({
    ...jest.requireActual("~Networking"),
    fetchStargateTotalSupply: jest.fn(),
    fetchStargateTotalVetStaked: jest.fn(),
    fetchStargateRewardsDistributed: jest.fn(),
}))

jest.mock("~Hooks/Staking", () => ({
    useLevelCirculatingSupplies: jest.fn(),
}))

describe("useStargateStats", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return the stargate stats", async () => {
        ;(fetchStargateTotalSupply as jest.Mock).mockResolvedValue({
            total: 12816,
            byLevel: {
                Dawn: 5509,
                Strength: 920,
                ThunderX: 117,
                Flash: 2148,
                VeThorX: 235,
                Lightning: 3043,
                StrengthX: 457,
                MjolnirX: 98,
                Mjolnir: 26,
                Thunder: 263,
            },
        })
        ;(fetchStargateTotalVetStaked as jest.Mock).mockResolvedValue({
            total: "6318030000000000000000000000",
            byLevel: {
                Dawn: "55080000000000000000000000",
                Strength: "920000000000000000000000000",
                ThunderX: "655200000000000000000000000",
                Flash: "429600000000000000000000000",
                VeThorX: "141000000000000000000000000",
                Lightning: "152150000000000000000000000",
                StrengthX: "731200000000000000000000000",
                MjolnirX: "1528800000000000000000000000",
                Mjolnir: "390000000000000000000000000",
                Thunder: "1315000000000000000000000000",
            },
        })
        ;(fetchStargateRewardsDistributed as jest.Mock).mockResolvedValue("526381931206666467000000000")
        ;(useLevelCirculatingSupplies as jest.Mock).mockImplementation(() => ({
            data: [25, 20, 15, 10, 5, 3, 10, 15, 20, 25],
            isLoading: false,
            error: undefined,
            isError: false,
        }))

        const { result, waitFor } = renderHook(() => useStargateStats(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.data).toBeDefined()
        })

        expect(result.current.data?.totalSupply?.total).toBe(12816)
        expect(result.current.data?.totalVetStaked?.total).toBe("6318030000000000000000000000")
        expect(result.current.data?.rewardsDistributed).toBe("526381931206666467000000000")
        expect(result.current.data?.vthoPerDay).toBe(1181630.68475904)
    })
})
