import { renderHook } from "@testing-library/react-hooks"
import { useDAppTags } from "./useDAppTags"
import { DiscoveryDApp } from "~Constants"
import { DAppType } from "~Model"

describe("useDAppTags", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    // Test case for sustainability tag
    it("should return SUSTAINABILITY when tags include sustainability", () => {
        const dapp: DiscoveryDApp = {
            name: "Test DApp",
            href: "https://test.com",
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: 0,
            tags: ["sustainability", "other"],
        }

        const { result } = renderHook(() => useDAppTags({ dapp }))
        expect(result.current.getTag()).toBe(DAppType.SUSTAINABILTY)
    })

    // Test case for NFT tag
    it("should return NFT when tags include nft", () => {
        const dapp: DiscoveryDApp = {
            name: "Test DApp",
            href: "https://test.com",
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: 0,
            tags: ["nft", "vechain", "sdk"],
        }

        const { result } = renderHook(() => useDAppTags({ dapp }))
        expect(result.current.getTag()).toBe(DAppType.NFT)
    })

    // Test case for default tag (no NFT or SUSTAINABILITY)
    it("should return 'dapps' when tags don't include NFT or SUSTAINABILITY", () => {
        const dapp: DiscoveryDApp = {
            name: "Test DApp",
            href: "https://test.com",
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: 0,
            tags: ["defi", "wallet", "smart-accounts"],
        }

        const { result } = renderHook(() => useDAppTags({ dapp }))
        expect(result.current.getTag()).toBe(DAppType.DAPPS)
    })

    // Test case for case insensitivity
    it("should handle case insensitivity for tags", () => {
        const dapp: DiscoveryDApp = {
            name: "Test DApp",
            href: "https://test.com",
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: 0,
            tags: ["SuStAiNaBiLiTy", "wallet", "deFi"],
        }

        const { result } = renderHook(() => useDAppTags({ dapp }))
        expect(result.current.getTag()).toBe(DAppType.SUSTAINABILTY)
    })

    // Test case for undefined tags
    it("should handle undefined tags", () => {
        const dapp: DiscoveryDApp = {
            name: "Test DApp",
            href: "https://test.com",
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: 0,
            tags: undefined,
        }

        const { result } = renderHook(() => useDAppTags({ dapp }))
        expect(result.current.getTag()).toBe(DAppType.DAPPS)
    })

    // Test case for empty tags array
    it("should handle empty tags array", () => {
        const dapp: DiscoveryDApp = {
            name: "Test DApp",
            href: "https://test.com",
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: 0,
            tags: [],
        }

        const { result } = renderHook(() => useDAppTags({ dapp }))
        expect(result.current.getTag()).toBe(DAppType.DAPPS)
    })

    // Test case for priority (SUSTAINABILITY over NFT)
    it("should prioritize SUSTAINABILITY over NFT when both tags are present", () => {
        const dapp: DiscoveryDApp = {
            name: "Test DApp",
            href: "https://test.com",
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: 0,
            tags: ["sustainability", "nft", "other"],
        }

        const { result } = renderHook(() => useDAppTags({ dapp }))
        expect(result.current.getTag()).toBe(DAppType.SUSTAINABILTY)
    })
})
