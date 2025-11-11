/* eslint-disable max-len */
import { renderHook } from "@testing-library/react-hooks"
import { useTokenRegistryInfo } from "./useTokenRegistryInfo"
import { FungibleToken } from "~Model"
import { VET, VTHO } from "~Constants"

// Mock the i18n context
jest.mock("~i18n", () => ({
    useI18nContext: () => ({
        LL: {
            TOKEN_DESCRIPTION_VET: () =>
                "VET is the native token of the VeChainThor blockchain, with a fixed total supply of 86.7 billion. It is the network’s value-transfer and staking asset, underpinning on-chain economic activity and network security. VET can be used for staking on StarGate - VeChain’s native staking platform - allowing users to earn VeThor (VTHO) — the energy token that powers on-chain transactions — while also enabling participation in governance decisions that shape the blockchain’s future. Through this dual role, VET anchors both the value and utility of the VeChain ecosystem.",
        },
    }),
}))

describe("useTokenRegistryInfo", () => {
    const mockRegularToken: FungibleToken = {
        name: "VeThor",
        symbol: "VTHO",
        address: "0x0000000000000000000000000000456e65726779",
        decimals: 18,
        custom: false,
        icon: "mock-icon",
        desc: "VTHO is used to power transactions on VeChainThor.",
        links: {
            website: "https://www.vechain.org",
            twitter: "https://twitter.com/vechainofficial",
            telegram: "https://t.me/vechain_official_english",
        },
    }

    const mockWrappedToken: FungibleToken = {
        name: "Wrapped VET",
        symbol: "WVET",
        address: "0x123456",
        decimals: 18,
        custom: false,
        icon: "mock-icon",
        desc: "Wrapped VET token",
        links: {
            website: "https://example.com",
            twitter: "https://twitter.com/example",
            telegram: "https://t.me/example",
        },
        crossChainProvider: {
            name: "Bridge",
            url: "https://bridge.vechain.org",
        },
    }

    it("should return hardcoded description and VTHO social links for VET token", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(VET))

        expect(result.current.description).toBe(
            "VET is the native token of the VeChainThor blockchain, with a fixed total supply of 86.7 billion. It is the network’s value-transfer and staking asset, underpinning on-chain economic activity and network security. VET can be used for staking on StarGate - VeChain’s native staking platform - allowing users to earn VeThor (VTHO) — the energy token that powers on-chain transactions — while also enabling participation in governance decisions that shape the blockchain’s future. Through this dual role, VET anchors both the value and utility of the VeChain ecosystem.",
        )
        expect(result.current.links).toEqual(VTHO.links)
    })

    it("should return description and social links from registry for regular tokens", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(mockRegularToken))

        expect(result.current.description).toBe("VTHO is used to power transactions on VeChainThor.")
        expect(result.current.links).toEqual({
            website: "https://www.vechain.org",
            twitter: "https://twitter.com/vechainofficial",
            telegram: "https://t.me/vechain_official_english",
        })
    })

    it("should return only description for wrapped tokens (no social links)", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(mockWrappedToken))

        expect(result.current.description).toBe("Wrapped VET token")
        expect(result.current.links).toBeUndefined()
    })

    it("should return undefined description and social links when token has no registry data", () => {
        const mockTokenWithoutData: FungibleToken = {
            name: "Custom Token",
            symbol: "CT",
            address: "0xabcdef",
            decimals: 18,
            custom: true,
            icon: "mock-icon",
        }

        const { result } = renderHook(() => useTokenRegistryInfo(mockTokenWithoutData))

        expect(result.current.description).toBeUndefined()
        expect(result.current.links).toBeUndefined()
    })

    it("should memoize the result when token doesn't change", () => {
        const { result, rerender } = renderHook(() => useTokenRegistryInfo(mockRegularToken))

        const firstResult = result.current
        rerender()
        const secondResult = result.current

        expect(firstResult).toBe(secondResult)
    })
})
