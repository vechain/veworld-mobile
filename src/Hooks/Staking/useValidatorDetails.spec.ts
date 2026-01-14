import { renderHook } from "@testing-library/react-hooks"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import { useIndexerUrl } from "~Hooks/useIndexerUrl"
import { TestWrapper } from "~Test"

import { useValidatorDetails } from "./useValidatorDetails"

jest.mock("~Hooks/useIndexerUrl", () => ({ useIndexerUrl: jest.fn() }))
jest.mock("~Hooks/useIndexerClient", () => ({ useIndexerClient: jest.fn() }))

const MOCK_RESPONSE = {
    avgDelegatorYield: 5.163643,
    blockId: "0x016a09d9b83f1990be3e599fd5b5c79efeeca914f68e44474054d55e49124479",
    blockNumber: 23726553,
    blockProbability: 0.013976,
    blockTimestamp: 1767796270,
    blocksPerEpoch: 2.51568,
    blocksPerYear: 44104.90176,
    completedPeriods: 4,
    cycleEndBlock: 23777280,
    cyclePeriodLength: 60480,
    delegatorExitingVetStaked: 1270000,
    delegatorQueuedVetStaked: 0,
    delegatorTvl: 1091133,
    delegatorVetStaked: 88710000,
    endorser: "0xbd98ee8a7dacb795e75d00cb661e1148ea590efa",
    exitingVetStaked: 1270000,
    id: "0x3cb613f453e94c33e39db3be41413192b930f465",
    nextCycleAvgDelegatorYield: 5.151362,
    nextCycleTvlBasedYield: 5.722863,
    nextCycleValidatorYield: 7.721744,
    nftYieldsNextCycle: {
        Dawn: 1.4337,
        Flash: 1.864541,
        Lightning: 1.648873,
        Mjolnir: 4.684721,
        MjolnirX: 6.542555,
        Strength: 2.153125,
        StrengthX: 4.296764,
        Thunder: 3.549978,
        ThunderX: 5.620646,
        VeThorX: 2.871813,
    },
    offlineBlocks: 0,
    online: true,
    percentageOffline: 0,
    queuedVetStaked: 0,
    startBlock: 23474880,
    status: "ACTIVE",
    totalTvl: 1398633,
    totalWeight: 168010000,
    tvlBasedYield: 5.754825,
    validatorExitingVetStaked: 0,
    validatorQueuedVetStaked: 0,
    validatorTvl: 307500,
    validatorVetStaked: 25000000,
    validatorYield: 7.852574,
    vetStaked: 113710000,
}

describe("useValidatorDetails", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should get the validator details", async () => {
        const GET = jest.fn()
        jest.mocked(useIndexerUrl).mockReturnValue("https://test.com")
        ;(useIndexerClient as jest.Mock).mockReturnValue({
            GET: GET.mockResolvedValue({
                data: {
                    data: [MOCK_RESPONSE],
                },
            }),
        })

        const { result, waitFor } = renderHook(() => useValidatorDetails({ validatorId: "0x0" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toStrictEqual(MOCK_RESPONSE)
        })

        expect(GET).toHaveBeenCalledWith("/api/v1/validators", {
            params: {
                query: {
                    validatorId: "0x0",
                },
            },
        })
    })
    it("should return null if no validator has been found", async () => {
        const GET = jest.fn()
        jest.mocked(useIndexerUrl).mockReturnValue("https://test.com")
        ;(useIndexerClient as jest.Mock).mockReturnValue({
            GET: GET.mockResolvedValue({
                data: {
                    data: [],
                },
            }),
        })

        const { result, waitFor } = renderHook(() => useValidatorDetails({ validatorId: "0x0" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toStrictEqual(null)
        })

        expect(GET).toHaveBeenCalledWith("/api/v1/validators", {
            params: {
                query: {
                    validatorId: "0x0",
                },
            },
        })
    })
})
