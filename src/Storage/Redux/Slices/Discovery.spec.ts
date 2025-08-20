import { ethers } from "ethers"
import {
    addSession,
    clearTemporarySessions,
    closeAllTabs,
    closeTab,
    deleteSession,
    DiscoverySlice,
    DiscoveryState,
    incrementBannerInteractions,
    LoginSession,
    openTab,
    Tab,
    updateTab,
} from "./Discovery"
import { HexUInt } from "@vechain/sdk-core"

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
    describe("sessions", () => {
        const mockSessions = (...sessions: [string, LoginSession][]): DiscoveryState => {
            return {
                connectedApps: [],
                custom: [],
                favorites: [],
                featured: [],
                hasOpenedDiscovery: true,
                bannerInteractions: {},
                tabsManager: {
                    currentTabId: null,
                    tabs: [],
                },
                sessions: sessions.length === 0 ? undefined : Object.fromEntries(sessions),
            }
        }
        it("clearTemporarySessions", () => {
            const externalSession = {
                kind: "external",
                address: ethers.Wallet.createRandom().address,
                genesisId: HexUInt.random(32).toString(),
                url: "https://vechain.org",
            } as const
            const newState = DiscoverySlice.reducer(
                mockSessions(
                    ["https://vechain.org", externalSession],
                    [
                        "https://docs.vechain.org",
                        {
                            kind: "temporary",
                            address: ethers.Wallet.createRandom().address,
                            genesisId: HexUInt.random(32).toString(),
                            url: "https://docs.vechain.org",
                        },
                    ],
                ),
                clearTemporarySessions(),
            )
            expect(Object.keys(newState.sessions ?? {}).length).toBe(1)
            expect(newState.sessions).toStrictEqual({
                "https://vechain.org": externalSession,
            })
        })
        it("deleteSession", () => {
            const newState = DiscoverySlice.reducer(
                mockSessions([
                    "https://docs.vechain.org",
                    {
                        kind: "temporary",
                        address: ethers.Wallet.createRandom().address,
                        genesisId: HexUInt.random(32).toString(),
                        url: "https://docs.vechain.org",
                    },
                ]),
                deleteSession("https://docs.vechain.org/test"),
            )
            expect(Object.keys(newState.sessions ?? {}).length).toBe(0)
            const stateWithoutSessions = DiscoverySlice.reducer(
                mockSessions(),
                deleteSession("https://docs.vechain.org/test"),
            )
            expect(Object.keys(stateWithoutSessions.sessions ?? {}).length).toBe(0)
            const stateWithNotFoundSession = DiscoverySlice.reducer(
                mockSessions([
                    "https://docs.vechain.org",
                    {
                        kind: "temporary",
                        address: ethers.Wallet.createRandom().address,
                        genesisId: HexUInt.random(32).toString(),
                        url: "https://docs.vechain.org",
                    },
                ]),
                deleteSession("https://docs.vebetterdao.org/test"),
            )
            expect(Object.keys(stateWithNotFoundSession.sessions ?? {}).length).toBe(1)
        })
        it("addSession", () => {
            const newState = DiscoverySlice.reducer(
                mockSessions([
                    "https://docs.vechain.org",
                    {
                        kind: "temporary",
                        address: ethers.Wallet.createRandom().address,
                        genesisId: HexUInt.random(32).toString(),
                        url: "https://docs.vechain.org",
                    },
                ]),
                addSession({
                    url: "https://docs.vebetterdao.org/test",
                    address: "0x0",
                    genesisId: "0x0",
                    kind: "temporary",
                }),
            )
            expect(Object.keys(newState.sessions ?? {}).length).toBe(2)
            expect(newState.sessions?.["https://docs.vebetterdao.org"]).toStrictEqual({
                url: "https://docs.vebetterdao.org",
                address: "0x0",
                genesisId: "0x0",
                kind: "temporary",
            })
            const stateWithoutSessions = DiscoverySlice.reducer(
                mockSessions(),
                addSession({
                    url: "https://docs.vebetterdao.org/test",
                    address: "0x0",
                    genesisId: "0x0",
                    kind: "temporary",
                }),
            )
            expect(Object.keys(stateWithoutSessions.sessions ?? {}).length).toBe(1)
            expect(stateWithoutSessions.sessions?.["https://docs.vebetterdao.org"]).toStrictEqual({
                url: "https://docs.vebetterdao.org",
                address: "0x0",
                genesisId: "0x0",
                kind: "temporary",
            })
        })
    })
})
