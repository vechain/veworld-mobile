import { DiscoverySlice, initialDiscoverState } from "./Discovery"
import { DiscoveryDApp } from "~Constants"

describe("Discovery Slice - Custom Bookmarks", () => {
    describe("addBookmark", () => {
        it("should add custom dApp to favoriteRefs", () => {
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

            // Should be in favoriteRefs with type "custom" (custom array is deprecated)
            expect(state.favoriteRefs).toHaveLength(1)
            expect(state.favoriteRefs?.[0]).toMatchObject({
                type: "custom",
                url: "https://custom.com",
                title: "Custom Site",
                order: 0,
            })
        })

        it("should add app-hub dApp to favoriteRefs", () => {
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

            // Should only be in favoriteRefs with type "app-hub" (favorites array is deprecated)
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

            // All dApps should be in favoriteRefs (favorites/custom arrays are deprecated)
            expect(state.favoriteRefs).toHaveLength(3)

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
        it("should remove custom dApp from favoriteRefs", () => {
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

            // Should be in favoriteRefs (custom array is deprecated)
            expect(state.favoriteRefs).toHaveLength(1)

            // Now remove it
            state = DiscoverySlice.reducer(state, {
                type: "discovery/removeBookmark",
                payload: {
                    href: "https://custom.com",
                    isCustom: true,
                },
            })

            // Should be removed from favoriteRefs
            expect(state.favoriteRefs).toHaveLength(0)
        })
    })
})
