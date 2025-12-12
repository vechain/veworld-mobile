import { TestWrapper } from "~Test"

import { useIsNormalUser } from "./useIsNormalUser"
import { renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"
import { VET } from "~Constants"
import { useQuery } from "@tanstack/react-query"
import { useVetBalances } from "./useVetBalances"
import { Balance } from "~Model"

const setIsNormalUser = jest.fn().mockImplementation(payload => ({ type: "discovery/setIsNormalUser", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    setIsNormalUser: (...args: any[]) => setIsNormalUser(...args),
}))

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: jest.fn(),
}))

jest.mock("./useVetBalances", () => ({
    useVetBalances: jest.fn(),
}))

describe("useIsNormalUser", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    test("should use the cached value if true", () => {
        ;(useQuery as jest.Mock).mockReturnValue({ data: undefined })
        ;(useVetBalances as jest.Mock).mockReturnValue({ data: [] })
        const { result } = renderHook(() => useIsNormalUser(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        bannerInteractions: {},
                        connectedApps: [],
                        custom: [],

                        favoriteRefs: [],
                        featured: [],
                        hasOpenedDiscovery: false,
                        tabsManager: {
                            currentTabId: null,
                            tabs: [],
                        },
                        isNormalUser: true,
                    },
                },
            },
        })

        expect(result.current).toBe(true)
    })

    test("should return true if the user has enough balance across wallets", () => {
        ;(useQuery as jest.Mock).mockReturnValue({ data: undefined })
        ;(useVetBalances as jest.Mock).mockReturnValue({
            data: [
                {
                    balance: ethers.utils.parseEther("1").toString(),
                    isHidden: false,
                    timeUpdated: Date.now().toString(),
                    tokenAddress: VET.address,
                },
                {
                    balance: ethers.utils.parseEther("1").toString(),
                    isHidden: false,
                    timeUpdated: Date.now().toString(),
                    tokenAddress: VET.address,
                },
                {
                    balance: ethers.utils.parseEther("1").toString(),
                    isHidden: false,
                    timeUpdated: Date.now().toString(),
                    tokenAddress: VET.address,
                },
                {
                    balance: ethers.utils.parseEther("7").toString(),
                    isHidden: false,
                    timeUpdated: Date.now().toString(),
                    tokenAddress: VET.address,
                },
            ] satisfies Balance[],
        })
        const { result } = renderHook(() => useIsNormalUser(), {
            wrapper: TestWrapper,
        })

        expect(result.current).toBe(true)
        expect(setIsNormalUser).toHaveBeenCalled()
    })
    test("should return true if the user has completed at least 3 actions", () => {
        ;(useQuery as jest.Mock).mockReturnValue({ data: true })
        ;(useVetBalances as jest.Mock).mockReturnValue({ data: [] })

        const { result } = renderHook(() => useIsNormalUser(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    accounts: {
                        accounts: [
                            {
                                address: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                alias: "Account 1",
                                index: 0,
                                rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                                visible: true,
                            },
                        ],
                        selectedAccount: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    },
                    balances: {
                        mainnet: {},
                        testnet: {},
                        other: {},
                        solo: {},
                    },
                },
            },
        })

        expect(result.current).toBe(true)
        expect(setIsNormalUser).toHaveBeenCalled()
    })
})
