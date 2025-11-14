import { renderHook } from "@testing-library/react-hooks"
import { defaultMainNetwork } from "~Constants"

import { TestWrapper } from "~Test"
import { NetworkHardFork } from "~Model"

import { useIsBlockchainHayabusa } from "./useIsBlockchainHayabusa"

const getBytecode = jest.fn()

const setHardFork = jest.fn().mockImplementation(payload => ({ type: "networks/setHardFork", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    setHardFork: (...args: any[]) => setHardFork(...args),
}))

jest.mock("~Hooks/useThorClient", () => ({
    useNetworkThorClient: jest.fn().mockReturnValue({
        accounts: {
            getBytecode: (...args: any[]) => getBytecode(...args),
        },
    }),
}))

describe("useIsBlockchainHayabusa", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should return true if staker contract has code but is not cached", async () => {
        getBytecode.mockResolvedValue("0x0001")
        const { result, waitFor } = renderHook(() => useIsBlockchainHayabusa(defaultMainNetwork), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isHayabusa).toBe(true)
        })
        expect(setHardFork).toHaveBeenCalledWith(NetworkHardFork.HAYABUSA)
    })
    it("should return true if staker contract does not have code but is cached", async () => {
        getBytecode.mockResolvedValue("0x")
        const { result, waitFor } = renderHook(() => useIsBlockchainHayabusa(defaultMainNetwork), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    networks: {
                        selectedNetwork: defaultMainNetwork.id,
                        customNetworks: [],
                        showTestNetTag: false,
                        isNodeError: false,
                        showConversionOtherNets: false,
                        hardfork: {
                            [defaultMainNetwork.genesis.id]: NetworkHardFork.HAYABUSA,
                        },
                    },
                },
            },
        })

        await waitFor(() => {
            expect(result.current.isHayabusa).toBe(true)
        })
        expect(setHardFork).not.toHaveBeenCalled()
        expect(getBytecode).not.toHaveBeenCalled()
    })
    it("should return false if staker contract does not have code and is not cached", async () => {
        getBytecode.mockResolvedValue("0x")
        const { result, waitFor } = renderHook(() => useIsBlockchainHayabusa(defaultMainNetwork), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    networks: {
                        selectedNetwork: defaultMainNetwork.id,
                        customNetworks: [],
                        showTestNetTag: false,
                        isNodeError: false,
                        showConversionOtherNets: false,
                        hardfork: {
                            [defaultMainNetwork.genesis.id]: NetworkHardFork.FINALITY,
                        },
                    },
                },
            },
        })

        await waitFor(() => {
            expect(result.current.isHayabusa).toBe(false)
        })
        expect(setHardFork).not.toHaveBeenCalled()
        expect(getBytecode).toHaveBeenCalled()
    })
})
