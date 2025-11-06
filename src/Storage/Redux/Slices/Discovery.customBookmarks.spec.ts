import { DiscoverySlice, initialDiscoverState } from "./Discovery"
import { DiscoveryDApp } from "~Constants"

describe("Discovery Slice - Custom Bookmarks", () => {
    describe("addBookmark", () => {
        it("should add custom dApp to both state.custom and favoriteRefs", () => {
            const customDApp: DiscoveryDApp = {
                name: "Custom Site",
                href: "https://custom.com",
                desc: "My custom website",
                isCustom: true,
                createAt: Date.now(),
                amountOfNavigations: 1,
            }

            const state = DiscoverySlice.reducer(initialDiscoverState, {
                type: "discovery/addBookmark",
                payload: customDApp,
            })

            // Should be in state.custom
            expect(state.custom).toHaveLength(1)
            expect(state.custom[0].href).toBe("https://custom.com")

            // Should also be in favoriteRefs with type "custom"
            expect(state.favoriteRefs).toHaveLength(1)
            expect(state.favoriteRefs?.[0]).toMatchObject({
                type: "custom",
                url: "https://custom.com",
                title: "Custom Site",
                order: 0,
            })
        })

        it("should add app-hub dApp to both state.favorites and favoriteRefs", () => {
            const appHubDApp: DiscoveryDApp = {
                id: "app-1",
                name: "App Hub App",
                href: "https://apphub.com",
                desc: "An app from the hub",
                isCustom: false,
                createAt: Date.now(),
                amountOfNavigations: 1,
            }

            const state = DiscoverySlice.reducer(initialDiscoverState, {
                type: "discovery/addBookmark",
                payload: appHubDApp,
            })

            // Should be in state.favorites
            expect(state.favorites).toHaveLength(1)
            expect(state.favorites[0].href).toBe("https://apphub.com")

            // Should also be in favoriteRefs with type "app-hub"
            expect(state.favoriteRefs).toHaveLength(1)
            expect(state.favoriteRefs?.[0]).toMatchObject({
                type: "app-hub",
                id: "app-1",
                order: 0,
            })
        })
    })

    describe("reorderBookmarks", () => {
        it("should maintain custom dApps when reordering", () => {
            const mixedDApps: DiscoveryDApp[] = [
                {
                    id: "app-1",
                    name: "App 1",
                    href: "https://app1.com",
                    desc: "App",
                    isCustom: false,
                    createAt: 0,
                    amountOfNavigations: 1,
                },
                {
                    name: "Custom Site",
                    href: "https://custom.com",
                    desc: "Custom",
                    isCustom: true,
                    createAt: Date.now(),
                    amountOfNavigations: 1,
                },
                {
                    name: "VBD App",
                    href: "https://vbd.com",
                    desc: "VBD",
                    isCustom: false,
                    createAt: 0,
                    amountOfNavigations: 1,
                    veBetterDaoId: "vbd-1",
                },
            ]

            const state = DiscoverySlice.reducer(initialDiscoverState, {
                type: "discovery/reorderBookmarks",
                payload: mixedDApps,
            })

            // state.favorites should have non-custom dApps
            expect(state.favorites).toHaveLength(2)
            expect(state.favorites.some(d => d.id === "app-1")).toBe(true)
            expect(state.favorites.some(d => d.veBetterDaoId === "vbd-1")).toBe(true)

            // state.custom should have custom dApps
            expect(state.custom).toHaveLength(1)
            expect(state.custom[0].href).toBe("https://custom.com")

            // favoriteRefs should have ALL dApps in order
            expect(state.favoriteRefs).toHaveLength(3)
            expect(state.favoriteRefs?.[0]).toMatchObject({
                type: "app-hub",
                id: "app-1",
                order: 0,
            })
            expect(state.favoriteRefs?.[1]).toMatchObject({
                type: "custom",
                url: "https://custom.com",
                order: 1,
            })
            expect(state.favoriteRefs?.[2]).toMatchObject({
                type: "vbd",
                vbdId: "vbd-1",
                order: 2,
            })
        })

        it("should update order correctly after reordering with custom dApps", () => {
            // Reorder: move custom to first position
            const reorderedDApps: DiscoveryDApp[] = [
                {
                    name: "Custom Site",
                    href: "https://custom.com",
                    desc: "Custom",
                    isCustom: true,
                    createAt: Date.now(),
                    amountOfNavigations: 1,
                },
                {
                    id: "app-1",
                    name: "App 1",
                    href: "https://app1.com",
                    desc: "App",
                    isCustom: false,
                    createAt: 0,
                    amountOfNavigations: 1,
                },
            ]

            const state = DiscoverySlice.reducer(initialDiscoverState, {
                type: "discovery/reorderBookmarks",
                payload: reorderedDApps,
            })

            // Order should be preserved in favoriteRefs
            expect(state.favoriteRefs).toHaveLength(2)
            expect(state.favoriteRefs?.[0]).toMatchObject({
                type: "custom",
                order: 0,
            })
            expect(state.favoriteRefs?.[1]).toMatchObject({
                type: "app-hub",
                order: 1,
            })
        })
    })

    describe("removeBookmark - custom dApp", () => {
        it("should remove custom dApp from both state.custom and favoriteRefs", () => {
            // First add a custom bookmark
            let state = DiscoverySlice.reducer(initialDiscoverState, {
                type: "discovery/addBookmark",
                payload: {
                    name: "Custom Site",
                    href: "https://custom.com",
                    desc: "Custom",
                    isCustom: true,
                    createAt: Date.now(),
                    amountOfNavigations: 1,
                },
            })

            expect(state.custom).toHaveLength(1)
            expect(state.favoriteRefs).toHaveLength(1)

            // Now remove it
            state = DiscoverySlice.reducer(state, {
                type: "discovery/removeBookmark",
                payload: {
                    href: "https://custom.com",
                    isCustom: true,
                },
            })

            // Should be removed from both
            expect(state.custom).toHaveLength(0)
            expect(state.favoriteRefs).toHaveLength(0)
        })
    })
})
