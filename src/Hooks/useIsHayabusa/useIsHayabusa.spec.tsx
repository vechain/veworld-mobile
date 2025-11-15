import { renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"
import React, { PropsWithChildren } from "react"
import { FeatureFlags } from "~Api/FeatureFlags"
import { FeatureFlagsContext, initialState } from "~Components/Providers/FeatureFlagsProvider"
import { defaultMainNetwork } from "~Constants"
import { useIsBlockchainHayabusa } from "~Hooks/useIsBlockchainHayabusa"
import { TestWrapper } from "~Test"
import { useIsHayabusa } from "./useIsHayabusa"

jest.mock("~Hooks/useIsBlockchainHayabusa", () => ({
    useIsBlockchainHayabusa: jest.fn(),
}))

const FeatureFlagsWrapper = ({
    children,
    featureFlags,
}: PropsWithChildren<{ featureFlags: FeatureFlags["forks"]["HAYABUSA"]["stargate"] }>) => {
    return (
        <TestWrapper preloadedState={{}}>
            <FeatureFlagsContext.Provider
                value={{ ...initialState, forks: { ...initialState.forks, HAYABUSA: { stargate: featureFlags } } }}>
                {children}
            </FeatureFlagsContext.Provider>
        </TestWrapper>
    )
}

describe("useIsHayabusa", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should return true if is hayabusa on blockchain and contract is valid", () => {
        ;(useIsBlockchainHayabusa as jest.Mock).mockReturnValue({ isHayabusa: true })

        const { result } = renderHook(() => useIsHayabusa(defaultMainNetwork), {
            wrapper: FeatureFlagsWrapper,
            initialProps: {
                featureFlags: {
                    [defaultMainNetwork.genesis.id]: {
                        contract: ethers.Wallet.createRandom().address,
                    },
                },
            },
        })

        expect(result.current).toBe(true)
    })
    it("should return false if is hayabusa on blockchain and contract is zero address", () => {
        ;(useIsBlockchainHayabusa as jest.Mock).mockReturnValue({ isHayabusa: true })

        const { result } = renderHook(() => useIsHayabusa(defaultMainNetwork), {
            wrapper: FeatureFlagsWrapper,
            initialProps: {
                featureFlags: {
                    [defaultMainNetwork.genesis.id]: {
                        contract: ethers.constants.AddressZero,
                    },
                },
            },
        })

        expect(result.current).toBe(false)
    })
    it("should return false if is hayabusa on blockchain and contract is not available", () => {
        ;(useIsBlockchainHayabusa as jest.Mock).mockReturnValue({ isHayabusa: true })

        const { result } = renderHook(() => useIsHayabusa(defaultMainNetwork), {
            wrapper: FeatureFlagsWrapper,
            initialProps: {
                featureFlags: {
                    [defaultMainNetwork.genesis.id]: {
                        contract: null!,
                    },
                },
            },
        })

        expect(result.current).toBe(false)
    })
    it("should return false if is hayabusa on blockchain and there is no FF config for that genesis id", () => {
        ;(useIsBlockchainHayabusa as jest.Mock).mockReturnValue({ isHayabusa: true })

        const { result } = renderHook(() => useIsHayabusa(defaultMainNetwork), {
            wrapper: FeatureFlagsWrapper,
            initialProps: {
                featureFlags: {
                    ["0x0"]: {
                        contract: null!,
                    },
                },
            },
        })

        expect(result.current).toBe(false)
    })
    it("should return false if is not hayabusa on blockchain and FF is set correctly", () => {
        ;(useIsBlockchainHayabusa as jest.Mock).mockReturnValue({ isHayabusa: false })

        const { result } = renderHook(() => useIsHayabusa(defaultMainNetwork), {
            wrapper: FeatureFlagsWrapper,
            initialProps: {
                featureFlags: {
                    [defaultMainNetwork.genesis.id]: {
                        contract: ethers.Wallet.createRandom().address,
                    },
                },
            },
        })

        expect(result.current).toBe(false)
    })
})
