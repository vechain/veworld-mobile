import { DiscoverySlice, DiscoveryState, incrementBannerInteractions } from "./Discovery"

describe("DiscoverySlice", () => {
    describe("bannerInteractions", () => {
        const mockInteractions = (...args: [appName: string, amount: number][]): DiscoveryState => {
            return {
                connectedApps: [],
                custom: [],
                favorites: [],
                featured: [],
                hasOpenedDiscovery: true,
                bannerInteractions: Object.fromEntries(args.map(arg => [arg[0], { amountOfInteractions: arg[1] }])),
                tabsManager: {
                    currentTabId: null,
                    tabs: [],
                },
            }
        }
        it("Should increment the banner interactions of a known app", () => {
            const newState = DiscoverySlice.reducer(mockInteractions(["APP", 1]), incrementBannerInteractions("APP"))
            expect(newState.bannerInteractions).toStrictEqual({
                APP: {
                    amountOfInteractions: 2,
                },
            })
        })
        it("Should set the banner interactions to 1 of a unknown app", () => {
            const newState = DiscoverySlice.reducer(mockInteractions(), incrementBannerInteractions("APP"))
            expect(newState.bannerInteractions).toStrictEqual({
                APP: {
                    amountOfInteractions: 1,
                },
            })
        })
    })
})
