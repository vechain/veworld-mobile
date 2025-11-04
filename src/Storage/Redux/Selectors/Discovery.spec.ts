import { selectBookmarkedDapps, selectSession } from "./Discovery"
import { DiscoveryDApp } from "~Constants"
import { DAppReference } from "../Slices"

describe("Discovery", () => {
    describe("selectBookmarkedDapps", () => {
        it("should return bookmarked dApps from favoriteRefs when available", () => {
            const featuredDapp: DiscoveryDApp = {
                id: "dapp1",
                name: "Test DApp",
                href: "https://test.com",
                createAt: Date.now(),
                isCustom: false,
                amountOfNavigations: 0,
                veBetterDaoId: "vbd1",
            }

            const favoriteRef: DAppReference = {
                type: "app-hub",
                id: "dapp1",
                order: 0,
            }

            const state = {
                discovery: {
                    featured: [featuredDapp],
                    favorites: [],
                    favoriteRefs: [favoriteRef],
                    custom: [],
                },
            }

            const result = selectBookmarkedDapps(state as any)
            expect(result).toHaveLength(1)
            expect(result[0].name).toBe("Test DApp")
            expect(result[0].id).toBe("dapp1")
        })

        it("should resolve dApp from featured by veBetterDaoId when id not found", () => {
            const featuredDapp: DiscoveryDApp = {
                name: "Test DApp",
                href: "https://test.com",
                createAt: Date.now(),
                isCustom: false,
                amountOfNavigations: 0,
                veBetterDaoId: "vbd1",
            }

            const favoriteRef: DAppReference = {
                type: "vbd",
                vbdId: "vbd1",
                order: 0,
            }

            const state = {
                discovery: {
                    featured: [featuredDapp],
                    favorites: [],
                    favoriteRefs: [favoriteRef],
                    custom: [],
                },
            }

            const result = selectBookmarkedDapps(state as any)
            expect(result).toHaveLength(1)
            expect(result[0].name).toBe("Test DApp")
        })

        it("should fall back to old favorites array when favoriteRefs is empty", () => {
            const favoriteDapp: DiscoveryDApp = {
                id: "dapp1",
                name: "Old Favorite",
                href: "https://old.com",
                createAt: Date.now(),
                isCustom: false,
                amountOfNavigations: 0,
            }

            const state = {
                discovery: {
                    featured: [],
                    favorites: [favoriteDapp],
                    favoriteRefs: [],
                    custom: [],
                },
            }

            const result = selectBookmarkedDapps(state as any)
            expect(result).toHaveLength(1)
            expect(result[0].name).toBe("Old Favorite")
        })

        it("should include custom dApps", () => {
            const customDapp: DiscoveryDApp = {
                id: "custom1",
                name: "Custom DApp",
                href: "https://custom.com",
                createAt: Date.now(),
                isCustom: true,
                amountOfNavigations: 0,
            }

            const state = {
                discovery: {
                    featured: [],
                    favorites: [],
                    favoriteRefs: [],
                    custom: [customDapp],
                },
            }

            const result = selectBookmarkedDapps(state as any)
            expect(result).toHaveLength(1)
            expect(result[0].name).toBe("Custom DApp")
        })

        it("should reflect updated dApp metadata from featured list", () => {
            const featuredDapp: DiscoveryDApp = {
                id: "dapp1",
                name: "Updated Name",
                href: "https://test.com",
                iconUri: "https://new-icon.com/icon.png",
                createAt: Date.now(),
                isCustom: false,
                amountOfNavigations: 0,
                veBetterDaoId: "vbd1",
            }

            const favoriteRef: DAppReference = {
                type: "app-hub",
                id: "dapp1",
                order: 0,
            }

            const state = {
                discovery: {
                    featured: [featuredDapp],
                    favorites: [],
                    favoriteRefs: [favoriteRef],
                    custom: [],
                },
            }

            const result = selectBookmarkedDapps(state as any)
            expect(result[0].name).toBe("Updated Name")
            expect(result[0].iconUri).toBe("https://new-icon.com/icon.png")
        })
    })

    describe("selectSession", () => {
        it("should return a session if available", () => {
            const session = {
                address: "",
                genesisId: "",
                kind: "temporary",
                url: "https://vechain.org",
            } as const
            const state = {
                discovery: {
                    sessions: {
                        "https://vechain.org": session,
                    },
                },
            }
            expect(selectSession(state as any, "https://vechain.org/test")).toBe(session)
            expect(selectSession(state as any, "https://docs.vechain.org/test")).toBe(undefined)
        })
        it("should return a session comparing genesisId too", () => {
            const session = {
                address: "",
                genesisId: "0x123",
                kind: "temporary",
                url: "https://vechain.org",
            } as const
            const state = {
                discovery: {
                    sessions: {
                        "https://vechain.org": session,
                    },
                },
            }
            expect(selectSession(state as any, "https://vechain.org/test", "0x12")).toBe(undefined)
            expect(selectSession(state as any, "https://vechain.org/test", "0x123")).toBe(session)
        })
    })
})
