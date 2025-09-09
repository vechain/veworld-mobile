import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import moment from "moment"

import { useVeBetterDaoActiveDapps, useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { VbdDApp } from "~Model"
import { useNewDAppsV2 } from "./useNewDAppsV2"
import { useQuery } from "@tanstack/react-query"
import { randomBytes } from "crypto"
import { ethers } from "ethers"

jest.mock("~Hooks/useFetchFeaturedDApps")
jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: jest.fn().mockImplementation(args => {
        return { data: args.queryFn() }
    }),
}))

// Setup test dates
const twoMonthsAgo = moment().subtract(2, "months").valueOf()
const fourMonthsAgo = moment().subtract(4, "months").valueOf()

const createDapp = (overrides: Partial<VbdDApp> = {}) => {
    const seed = randomBytes(8).toString("hex")
    const id = `0x${seed}`
    const href = `https://${seed}.vechain.org`
    return {
        id,
        external_url: href,
        name: `DApp ${seed}`,
        teamWalletAddress: ethers.Wallet.createRandom().address,
        metadataURI: `ipfs://${seed}`,
        createdAtTimestamp: moment().unix().toString(),
        app_urls: [],
        banner: `ipfs://${seed}`,
        description: `Description ${seed}`,
        logo: `ipfs://${seed}`,
        screenshots: [],
        social_urls: [],
        ...overrides,
    } satisfies VbdDApp
}

describe("useNewDAppsV2", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useVeBetterDaoDapps as jest.Mock).mockImplementation(() => ({
            data: [],
            isFetching: false,
        }))
        ;(useQuery as jest.Mock).mockImplementation(args => {
            return { data: args.queryFn(), isLoading: false }
        })
    })

    it("should return new DApps created in the last 3 months", () => {
        const correctDapps = [
            createDapp({ createdAtTimestamp: moment(twoMonthsAgo).unix().toString() }),
            createDapp({ createdAtTimestamp: moment().subtract(1, "month").unix().toString() }),
        ]
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [
                ...correctDapps,
                createDapp({ createdAtTimestamp: moment().subtract(4, "month").unix().toString() }),
                createDapp({ createdAtTimestamp: moment().subtract(5, "month").unix().toString() }),
            ],
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDAppsV2(), {
            wrapper: TestWrapper,
        })

        // Check the result
        expect(result.current.isLoading).toBe(false)
        expect(result.current.newDapps).toHaveLength(2)
        expect(result.current.newDapps).toStrictEqual(expect.arrayContaining(correctDapps))
    })

    it("should return newest 10 DApps when no DApps are newer than 3 months", () => {
        const extraVeBetterDaoDapps = Array.from({ length: 15 }, (_, index) =>
            createDapp({
                createdAtTimestamp: moment(fourMonthsAgo - index * 1000)
                    .unix()
                    .toString(),
            }),
        )

        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: extraVeBetterDaoDapps,
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDAppsV2(), {
            wrapper: TestWrapper,
        })

        // Should return 10 DApps max when none are newer than 3 months
        expect(result.current.newDapps).toHaveLength(10)
    })

    it("should handle loading state correctly", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() => useNewDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.newDapps).toEqual([])
    })

    it("should handle empty data gracefully", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.newDapps).toEqual([])
    })
})
