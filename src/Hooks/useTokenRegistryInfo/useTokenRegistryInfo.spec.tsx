import { renderHook } from "@testing-library/react-hooks"
import React, { PropsWithChildren } from "react"
import { B3TR, VET, VOT3, VTHO } from "~Constants"
import { i18nObject } from "~i18n"
import { FungibleToken } from "~Model"
import { TestWrapper } from "~Test"
import { useTokenRegistryInfo } from "./useTokenRegistryInfo"

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

const PreloadedWrapper = ({ children }: PropsWithChildren) => {
    return (
        <TestWrapper
            preloadedState={{
                tokens: {
                    tokens: {
                        mainnet: {
                            custom: {},
                            officialTokens: mockOfficialTokens,
                            suggestedTokens: [],
                        },
                        testnet: {
                            custom: {},
                            officialTokens: [],
                            suggestedTokens: [],
                        },
                        other: {
                            custom: {},
                            officialTokens: [],
                            suggestedTokens: [],
                        },
                        solo: {
                            custom: {},
                            officialTokens: [],
                            suggestedTokens: [],
                        },
                    },
                },
            }}>
            {children}
        </TestWrapper>
    )
}

describe("useTokenRegistryInfo", () => {
    beforeEach(() => {
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

    it("should return hardcoded description and VTHO social links for VET token", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(VET), {
            wrapper: PreloadedWrapper,
        })

        expect(result.current.description).toBe(i18nObject("en").TOKEN_DESCRIPTION_VET())
        expect(result.current.links).toEqual(VTHO.links)
    })

    it("should lookup and return description and links from official tokens for B3TR", () => {
        // Pass B3TR constant (which doesn't have registry data)
        const { result } = renderHook(() => useTokenRegistryInfo(B3TR), {
            wrapper: PreloadedWrapper,
        })

        // Should find it in officialTokens and return registry data
        expect(result.current.description).toBe("B3TR description from registry")
        expect(result.current.links).toEqual({
            website: "https://b3tr.com",
            twitter: "https://twitter.com/b3tr",
        })
    })

    it("should lookup and return description and links from official tokens for VOT3", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(VOT3), {
            wrapper: PreloadedWrapper,
        })

        expect(result.current.description).toBe("VOT3 description from registry")
        expect(result.current.links).toEqual({
            website: "https://vot3.com",
        })
    })

    it("should lookup and return description and links from official tokens for VTHO", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(VTHO), {
            wrapper: PreloadedWrapper,
        })

        expect(result.current.description).toBe("VTHO description from registry")
        expect(result.current.links).toEqual({
            website: "https://www.vechain.org",
            twitter: "https://twitter.com/vechainofficial",
        })
    })

    it("should return description and social links from registry for regular tokens", () => {
        const { result } = renderHook(() => useTokenRegistryInfo(mockRegularToken), {
            wrapper: PreloadedWrapper,
        })

        expect(result.current.description).toBe("Regular token description")
        expect(result.current.links).toEqual({
            website: "https://regular.com",
            twitter: "https://twitter.com/regular",
        })
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

        const { result } = renderHook(() => useTokenRegistryInfo(mockTokenWithoutData), {
            wrapper: PreloadedWrapper,
        })

        expect(result.current.description).toBeUndefined()
        expect(result.current.links).toBeUndefined()
    })
})
