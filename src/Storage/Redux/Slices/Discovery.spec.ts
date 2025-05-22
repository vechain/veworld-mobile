import {
    closeAllTabs,
    closeTab,
    DiscoverySlice,
    DiscoveryState,
    incrementBannerInteractions,
    openTab,
    Tab,
    updateTab,
} from "./Discovery"

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
    describe("tabs", () => {
        const mockTabs = (currentTabId: string | null, ...tabs: Tab[]): DiscoveryState => {
            return {
                connectedApps: [],
                custom: [],
                favorites: [],
                featured: [],
                hasOpenedDiscovery: true,
                bannerInteractions: {},
                tabsManager: {
                    currentTabId,
                    tabs,
                },
            }
        }
        it("updateTab", () => {
            const newState = DiscoverySlice.reducer(
                mockTabs(null, { id: "tab1", href: "https://vechain.org", title: "test1" }),
                updateTab({ id: "tab1", href: "u" }),
            )
            expect(newState.tabsManager.tabs[0]).toStrictEqual({
                id: "tab1",
                href: "u",
                title: "test1",
            })
        })
        it("openTab", () => {
            const newState = DiscoverySlice.reducer(mockTabs(null), openTab({ id: "tab1", href: "u", title: "test" }))
            expect(newState.tabsManager.tabs).toHaveLength(1)
            expect(newState.tabsManager.currentTabId).toBe("tab1")
            expect(newState.tabsManager.tabs[0]).toStrictEqual({
                id: "tab1",
                href: "u",
                title: "test",
            })
        })
        it("closeTab (with one tab)", () => {
            const newState = DiscoverySlice.reducer(
                mockTabs(null, { id: "tab1", href: "u", title: "test" }),
                closeTab("tab1"),
            )
            expect(newState.tabsManager.tabs).toHaveLength(0)
            expect(newState.tabsManager.currentTabId).toBeNull()
        })
        it("closeTab (with two tabs)", () => {
            const newState = DiscoverySlice.reducer(
                mockTabs(null, { id: "tab1", href: "u", title: "test" }, { id: "tab2", href: "u2", title: "test2" }),
                closeTab("tab1"),
            )
            expect(newState.tabsManager.currentTabId).toBe("tab2")
            expect(newState.tabsManager.tabs).toHaveLength(1)
            expect(newState.tabsManager.tabs[0]).toStrictEqual({
                id: "tab2",
                href: "u2",
                title: "test2",
            })
        })
        it("closeAllTabs", () => {
            const newState = DiscoverySlice.reducer(
                mockTabs(null, { id: "tab1", href: "u", title: "test" }),
                closeAllTabs(),
            )
            expect(newState.tabsManager.tabs).toHaveLength(0)
            expect(newState.tabsManager.currentTabId).toBeNull()
        })
    })
})
