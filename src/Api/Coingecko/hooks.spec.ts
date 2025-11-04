import { renderHook } from "@testing-library/react-hooks"
import { useTokenSocialLinks } from "./hooks"
import { TokenInfoResponse } from "./endpoints"

describe("useTokenSocialLinks", () => {
    const mockTokenInfo: TokenInfoResponse = {
        id: "vechain",
        symbol: "VET",
        name: "VeChain",
        detail_platforms: {},
        image: {
            thumb: "",
            small: "",
            large: "",
        },
        description: {},
        links: {
            homepage: ["https://www.vechain.org", ""],
            blockchain_site: ["https://explore.vechain.org", null],
            official_forum_url: [null],
            chat_url: ["https://discord.gg/vechain", "https://t.me/vechain"],
            announcement_url: [null],
            twitter_screen_name: "vechainofficial",
            facebook_username: "vechainfoundation",
            telegram_channel_identifier: "vechain_official_english",
            subreddit_url: "https://www.reddit.com/r/Vechain",
            repos_url: {
                github: ["https://github.com/vechain/thor", null],
                bitbucket: [],
            },
        },
        market_data: {
            total_supply: 86712634466,
            max_supply: null,
            circulating_supply: 72714516834,
            last_updated: "2024-01-01T00:00:00.000Z",
            price_change_percentage_24h: 5.5,
            current_price: { usd: 0.05 },
            market_cap: { usd: 3635725832 },
            total_volume: { usd: 150000000 },
            high_24h: { usd: 0.052 },
            low_24h: { usd: 0.048 },
        },
    }

    it("should return null when tokenInfo is undefined", () => {
        const { result } = renderHook(() => useTokenSocialLinks(undefined))
        expect(result.current).toBeNull()
    })

    it("should extract and format website URL", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.website).toBe("https://www.vechain.org")
    })

    it("should format Twitter URL from screen name", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.twitter).toBe("https://twitter.com/vechainofficial")
    })

    it("should format Telegram URL from channel identifier", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.telegram).toBe("https://t.me/vechain_official_english")
    })

    it("should format Facebook URL from username", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.facebook).toBe("https://facebook.com/vechainfoundation")
    })

    it("should extract Reddit URL directly", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.reddit).toBe("https://www.reddit.com/r/Vechain")
    })

    it("should extract first non-null GitHub URL", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.github).toBe("https://github.com/vechain/thor")
    })

    it("should extract Discord URL from chat URLs", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.discord).toBe("https://discord.gg/vechain")
    })

    it("should extract first chat URL", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.chat).toBe("https://discord.gg/vechain")
    })

    it("should extract blockchain explorer URL", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.explorer).toBe("https://explore.vechain.org")
    })

    it("should return null for missing social links", () => {
        const { result } = renderHook(() => useTokenSocialLinks(mockTokenInfo))
        expect(result.current?.forum).toBeNull()
        expect(result.current?.announcement).toBeNull()
    })

    it("should handle empty arrays gracefully", () => {
        const emptyLinksToken: TokenInfoResponse = {
            ...mockTokenInfo,
            links: {
                homepage: [],
                blockchain_site: [],
                official_forum_url: [],
                chat_url: [],
                announcement_url: [],
                twitter_screen_name: null,
                facebook_username: null,
                telegram_channel_identifier: null,
                subreddit_url: null,
                repos_url: {
                    github: [],
                    bitbucket: [],
                },
            },
        }

        const { result } = renderHook(() => useTokenSocialLinks(emptyLinksToken))
        expect(result.current?.website).toBeNull()
        expect(result.current?.twitter).toBeNull()
        expect(result.current?.telegram).toBeNull()
        expect(result.current?.github).toBeNull()
    })
})
