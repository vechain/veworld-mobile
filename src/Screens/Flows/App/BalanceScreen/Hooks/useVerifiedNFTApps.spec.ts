import { TestWrapper } from "~Test"
import { renderHook } from "@testing-library/react-hooks"
import { useVerifiedNFTApps } from "./useVerifiedNFTApps"
import { DiscoveryDApp } from "~Constants/Constants"

const buildDapp = (overrides?: Partial<DiscoveryDApp>): DiscoveryDApp => {
    return {
        amountOfNavigations: 0,
        createAt: Date.now(),
        isCustom: true,
        name: "TEST DAPP",
        href: new URL(`https://vechain-${Math.random()}.org`).origin,
        ...overrides,
    }
}

const createInitialProps = (...dapps: DiscoveryDApp[]) => ({
    preloadedState: {
        discovery: {
            custom: [],
            featured: dapps,
            favorites: [],
            favoriteRefs: [],
            hasOpenedDiscovery: false,
            connectedApps: [],
            bannerInteractions: {},
            tabsManager: {
                currentTabId: null,
                tabs: [],
            },
        },
    },
})

describe("useVerifiedNFTApps", () => {
    it("should return the verified NFT apps", () => {
        const { result } = renderHook(() => useVerifiedNFTApps(), {
            wrapper: TestWrapper,
            initialProps: createInitialProps(
                buildDapp({ id: "com.thorhead", tags: ["nft"], name: "Thorhead" }),
                buildDapp({ id: "com.vechain.marketplace.stargate", tags: ["nft"], name: "Stargate" }),
                buildDapp({ id: "com.nfbc", tags: ["nft"], name: "NFBC" }),
            ),
        })

        expect(result.current).toBeDefined()
        expect(result.current.length).toBe(2)
    })

    it("should return empty array if no verified NFT apps", () => {
        const { result } = renderHook(() => useVerifiedNFTApps(), {
            wrapper: TestWrapper,
            initialProps: createInitialProps(
                buildDapp({ id: "org.thorhead2", tags: ["nft"], name: "Thorhead" }),
                buildDapp({ id: "org.vecn.marketplace.stargate", tags: ["nft"], name: "Stargate" }),
                buildDapp({ id: "com.nfbc.mark", tags: ["nft"], name: "NFBC" }),
            ),
        })

        expect(result.current).toBeDefined()
        expect(result.current.length).toBe(0)
    })
})
