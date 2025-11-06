import { act, renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"
import { TestWrapper } from "~Test"
import { RootState } from "~Storage/Redux/Types"
import { NETWORK_TYPE } from "~Model"

import { useBlacklistedCollection } from "./useBlacklistedCollection"

const toggleBlackListCollection = jest
    .fn()
    .mockImplementation(payload => ({ type: "nft/toggleBlackListCollection", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    toggleBlackListCollection: (...args: any[]) => toggleBlackListCollection(...args),
}))

const createMockedState = (...blacklistedCollections: string[]): Partial<RootState> => {
    return {
        nft: {
            collectionRegistryInfo: {
                mainnet: [],
                testnet: [],
                other: [],
                solo: [],
            },
            collections: {
                "0x0": {
                    collections: [],
                    pagination: {
                        countLimit: 0,
                        hasCount: false,
                        hasNext: false,
                        totalElements: 0,
                        totalPages: 0,
                    },
                },
            },
            isLoading: false,
            nfts: {},
            reportedCollections: {
                mainnet: {},
                testnet: {},
                other: {},
                solo: {},
            },
            blackListedCollections: {
                mainnet: {
                    "0xcf130b42ae33c5531277b4b7c0f1d994b8732957": {
                        addresses: blacklistedCollections,
                    },
                },
                testnet: {
                    "0xcf130b42ae33c5531277b4b7c0f1d994b8732957": {
                        addresses: [],
                    },
                },
                other: {
                    "0xcf130b42ae33c5531277b4b7c0f1d994b8732957": {
                        addresses: [],
                    },
                },
                solo: {
                    "0xcf130b42ae33c5531277b4b7c0f1d994b8732957": {
                        addresses: [],
                    },
                },
            },
            error: "",
            _persist: {
                rehydrated: false,
                version: 31,
            },
        },
    }
}

describe("useBlacklistedCollection", () => {
    it("should return isBlacklisted: true", () => {
        const addr1 = ethers.Wallet.createRandom().address
        const addr2 = ethers.Wallet.createRandom().address
        const r1 = renderHook(() => useBlacklistedCollection(addr1), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createMockedState(addr1),
            },
        })

        expect(r1.result.current.isBlacklisted).toBe(true)

        const r2 = renderHook(() => useBlacklistedCollection(addr2), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createMockedState(addr1),
            },
        })
        expect(r2.result.current.isBlacklisted).toBe(false)
    })
    it("should dispatch correctly", () => {
        const addr1 = ethers.Wallet.createRandom().address
        const { result } = renderHook(() => useBlacklistedCollection(addr1), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createMockedState(addr1),
            },
        })

        act(() => {
            result.current.toggleBlacklist()
        })

        expect(toggleBlackListCollection).toHaveBeenCalledWith({
            network: NETWORK_TYPE.MAIN,
            collectionAddress: addr1,
            accountAddress: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        })
    })
})
