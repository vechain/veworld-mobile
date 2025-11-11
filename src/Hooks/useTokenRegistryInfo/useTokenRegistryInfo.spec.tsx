/* eslint-disable max-len */
import { renderHook } from "@testing-library/react-hooks"
import { useTokenRegistryInfo } from "./useTokenRegistryInfo"
import { FungibleToken } from "~Model"
import { B3TR, VET, VOT3, VTHO } from "~Constants"

const mockOfficialTokens = [
    {
        symbol: "VTHO",
        name: "Vethor",
        address: "0x0000000000000000000000000000456e65726779",
        decimals: 18,
        custom: false,
        icon: VTHO.icon,
        desc: "VTHO description from registry",
        links: {
            website: "https://www.vechain.org",
            twitter: "https://twitter.com/vechainofficial",
        },
    },
    {
        symbol: "B3TR",
        name: "B3TR",
        address: "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",
        decimals: 18,
        custom: false,
        icon: B3TR.icon,
        desc: "B3TR description from registry",
        links: {
            website: "https://b3tr.com",
            twitter: "https://twitter.com/b3tr",
        },
    },
    {
        symbol: "VOT3",
        name: "VOT3",
        address: "0x76Ca782B59C74d088C7D2Cce2f211BC00836c602",
        decimals: 18,
        custom: false,
        icon: VOT3.icon,
        desc: "VOT3 description from registry",
        links: {
            website: "https://vot3.com",
        },
    },
]

// Mock Redux
jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    selectOfficialTokens: jest.fn(),
    useAppSelector: jest.fn(),
}))

// Mock the i18n context
jest.mock("~i18n", () => ({
    useI18nContext: () => ({
        LL: {
            TOKEN_DESCRIPTION_VET: () =>
                "VET is the native token of the VeChainThor blockchain, with a fixed total supply of 86.7 billion. It is the network's value-transfer and staking asset, underpinning on-chain economic activity and network security. VET can be used for staking on StarGate - VeChain's native staking platform - allowing users to earn VeThor (VTHO) — the energy token that powers on-chain transactions — while also enabling participation in governance decisions that shape the blockchain's future. Through this dual role, VET anchors both the value and utility of the VeChain ecosystem.",
        },
    }),
}))

const { useAppSelector } = require("~Storage/Redux")

describe("useTokenRegistryInfo", () => {
    beforeEach(() => {
        // Mock useAppSelector to return mockOfficialTokens
        ;(useAppSelector as jest.Mock).mockReturnValue(mockOfficialTokens)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })
    const mockRegularToken: FungibleToken = {
        name: "Regular Token",
        symbol: "REG",
        address: "0x123456",
        decimals: 18,
        custom: false,
        icon: "mock-icon",
        desc: "Regular token description",
        links: {
            website: "https://regular.com",
            twitter: "https://twitter.com/regular",
        },
    }

    const mockWrappedToken: FungibleToken = {
        name: "Wrapped VET",
        symbol: "WVET",
        address: "0x789abc",
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
            "VET is the native token of the VeChainThor blockchain, with a fixed total supply of 86.7 billion. It is the network's value-transfer and staking asset, underpinning on-chain economic activity and network security. VET can be used for staking on StarGate - VeChain's native staking platform - allowing users to earn VeThor (VTHO) — the energy token that powers on-chain transactions — while also enabling participation in governance decisions that shape the blockchain's future. Through this dual role, VET anchors both the value and utility of the VeChain ecosystem.",
        )
        expect(result.current.links).toEqual(VTHO.links)
    })

    it("should lookup and return description and links from official tokens for B3TR", () => {
        // Pass B3TR constant (which doesn't have registry data)
        const { result } = renderHook(() => useTokenRegistryInfo(B3TR))

        // Should find it in officialTokens and return registry data
        expect(result.current.description).toBe("B3TR description from registry")
        expect(result.current.links).toEqual({
            website: "https://b3tr.com",
            twitter: "https://twitter.com/b3tr",
        })
    })

    it("should lookup and return description and links from official tokens for VOT3", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(VOT3))

        expect(result.current.description).toBe("VOT3 description from registry")
        expect(result.current.links).toEqual({
            website: "https://vot3.com",
        })
    })

    it("should lookup and return description and links from official tokens for VTHO", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(VTHO))

        expect(result.current.description).toBe("VTHO description from registry")
        expect(result.current.links).toEqual({
            website: "https://www.vechain.org",
            twitter: "https://twitter.com/vechainofficial",
        })
    })

    it("should return description and social links from registry for regular tokens", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(mockRegularToken))

        expect(result.current.description).toBe("Regular token description")
        expect(result.current.links).toEqual({
            website: "https://regular.com",
            twitter: "https://twitter.com/regular",
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
