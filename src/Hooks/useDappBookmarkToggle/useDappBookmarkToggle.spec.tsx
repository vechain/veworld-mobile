import React from "react"
import { renderHook } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { useDappBookmarkToggle } from "./useDappBookmarkToggle"
import { DiscoveryDApp } from "~Constants"
import { DAppReference } from "~Storage/Redux/Slices"

const mockDispatch = jest.fn()

jest.mock("~Storage/Redux", () => {
    const actual = jest.requireActual("~Storage/Redux")
    return {
        ...actual,
        useAppDispatch: () => mockDispatch,
    }
})

jest.mock("~Hooks/useDappBookmarksList", () => ({
    useDappBookmarksList: jest.fn(),
}))

jest.mock("~Hooks/useFetchFeaturedDApps/useVeBetterDaoDapps", () => ({
    useVeBetterDaoDapps: jest.fn(),
}))

jest.mock("~Hooks/useAnalyticTracking", () => ({
    useAnalyticTracking: () => jest.fn(),
}))

const { useDappBookmarksList } = require("~Hooks/useDappBookmarksList")
const { useVeBetterDaoDapps } = require("~Hooks/useFetchFeaturedDApps/useVeBetterDaoDapps")

describe("useDappBookmarkToggle", () => {
    const mockFeaturedDapps: DiscoveryDApp[] = [
        {
            id: "mugshot-id",
            name: "Mugshot",
            desc: "NFT Marketplace",
            href: "https://mugshot2.vet",
            isCustom: false,
            createAt: 0,
            amountOfNavigations: 0,
        },
        {
            id: "vechain-id",
            name: "VeChain Stats",
            desc: "Stats",
            href: "https://vechainstats.com",
            isCustom: false,
            createAt: 0,
            amountOfNavigations: 0,
        },
    ]

    const mockVbdDapps = [
        {
            id: "vbd-app-1",
            name: "VBD App",
            description: "VBD Description",
            external_url: "https://vbdapp.com",
            logo: "https://vbdapp.com/logo.png",
            createdAtTimestamp: "1640995200",
        },
    ]

    const mockFavoriteRefs: DAppReference[] = [
        {
            type: "app-hub",
            id: "mugshot-id",
            order: 0,
        },
    ]

    const mockBookmarkedDapps: DiscoveryDApp[] = [
        {
            id: "mugshot-id",
            name: "Mugshot",
            desc: "NFT Marketplace",
            href: "https://mugshot2.vet", // New URL
            isCustom: false,
            createAt: 0,
            amountOfNavigations: 0,
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("URL change handling", () => {
        it("should recognize bookmarked app by ID even when URL changes", () => {
            useDappBookmarksList.mockReturnValue(mockBookmarkedDapps)
            useVeBetterDaoDapps.mockReturnValue({ data: mockVbdDapps, isLoading: false })

            const preloadedState = {
                discovery: {
                    featured: mockFeaturedDapps,

                    favoriteRefs: mockFavoriteRefs,
                    custom: [],
                    bannerInteractions: {},
                    connectedApps: [],
                    hasOpenedDiscovery: true,
                    tabsManager: {
                        currentTabId: null,
                        tabs: [],
                    },
                },
            }

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>{children}</TestWrapper>
            )

            const { result } = renderHook(() => useDappBookmarkToggle("https://mugshot2.vet", "Mugshot"), {
                wrapper,
            })

            expect(result.current.isBookMarked).toBe(true)
            expect(result.current.existingBookmark?.id).toBe("mugshot-id")
        })

        it("should recognize VBD app by vbdId even when URL changes", () => {
            const vbdBookmarkedDapps: DiscoveryDApp[] = [
                {
                    name: "VBD App",
                    desc: "VBD Description",
                    href: "https://vbdapp-new.com", // Changed URL - resolved from VBD API
                    isCustom: false,
                    createAt: 0,
                    amountOfNavigations: 0,
                    veBetterDaoId: "vbd-app-1",
                },
            ]

            const vbdFavoriteRefs: DAppReference[] = [
                {
                    type: "vbd",
                    vbdId: "vbd-app-1",
                    order: 0,
                },
            ]

            useDappBookmarksList.mockReturnValue(vbdBookmarkedDapps)
            useVeBetterDaoDapps.mockReturnValue({ data: mockVbdDapps, isLoading: false })

            const preloadedState = {
                discovery: {
                    featured: [],

                    favoriteRefs: vbdFavoriteRefs,
                    custom: [],
                    bannerInteractions: {},
                    connectedApps: [],
                    hasOpenedDiscovery: true,
                    tabsManager: {
                        currentTabId: null,
                        tabs: [],
                    },
                },
            }

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>{children}</TestWrapper>
            )

            // Test with the NEW URL (current URL from VBD API)
            const { result } = renderHook(() => useDappBookmarkToggle("https://vbdapp-new.com", "VBD App"), {
                wrapper,
            })

            expect(result.current.isBookMarked).toBe(true)
            expect(result.current.existingBookmark?.veBetterDaoId).toBe("vbd-app-1")
        })

        it("should not recognize app if ID doesn't match", () => {
            useDappBookmarksList.mockReturnValue(mockBookmarkedDapps)
            useVeBetterDaoDapps.mockReturnValue({ data: mockVbdDapps, isLoading: false })

            const preloadedState = {
                discovery: {
                    featured: mockFeaturedDapps,

                    favoriteRefs: mockFavoriteRefs,
                    custom: [],
                    bannerInteractions: {},
                    connectedApps: [],
                    hasOpenedDiscovery: true,
                    tabsManager: {
                        currentTabId: null,
                        tabs: [],
                    },
                },
            }

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>{children}</TestWrapper>
            )

            const { result } = renderHook(() => useDappBookmarkToggle("https://vechainstats.com", "VeChain Stats"), {
                wrapper,
            })

            expect(result.current.isBookMarked).toBe(false)
        })
    })

    describe("Bookmark detection", () => {
        it("should detect bookmarked app from useDappBookmarksList", () => {
            const bookmarkedDapp: DiscoveryDApp = {
                id: "instant-app",
                name: "Instant App",
                href: "https://instant.com",
                desc: "Test",
                isCustom: false,
                createAt: 0,
                amountOfNavigations: 0,
            }

            const favoriteRef: DAppReference = {
                type: "app-hub",
                id: "instant-app",
                order: 0,
            }

            useDappBookmarksList.mockReturnValue([bookmarkedDapp])
            useVeBetterDaoDapps.mockReturnValue({ data: [], isLoading: false })

            const preloadedState = {
                discovery: {
                    featured: [bookmarkedDapp],

                    favoriteRefs: [favoriteRef],
                    custom: [],
                    bannerInteractions: {},
                    connectedApps: [],
                    hasOpenedDiscovery: true,
                    tabsManager: {
                        currentTabId: null,
                        tabs: [],
                    },
                },
            }

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>{children}</TestWrapper>
            )

            const { result } = renderHook(() => useDappBookmarkToggle("https://instant.com", "Instant App"), {
                wrapper,
            })

            expect(result.current.isBookMarked).toBe(true)
            expect(result.current.existingBookmark).toBeTruthy()
            expect(result.current.existingBookmark?.id).toBe("instant-app")
        })
    })

    describe("Custom dapps", () => {
        it("should still use URL comparison for custom dapps", () => {
            const customBookmarkedDapps: DiscoveryDApp[] = [
                {
                    name: "Custom Site",
                    desc: "",
                    href: "https://custom.com",
                    isCustom: true,
                    createAt: Date.now(),
                    amountOfNavigations: 1,
                },
            ]

            const customFavoriteRefs: DAppReference[] = [
                {
                    type: "custom",
                    url: "https://custom.com",
                    title: "Custom Site",
                    createAt: Date.now(),
                    order: 0,
                },
            ]

            useDappBookmarksList.mockReturnValue(customBookmarkedDapps)
            useVeBetterDaoDapps.mockReturnValue({ data: [], isLoading: false })

            const preloadedState = {
                discovery: {
                    featured: [],

                    favoriteRefs: customFavoriteRefs,
                    custom: customBookmarkedDapps,
                    bannerInteractions: {},
                    connectedApps: [],
                    hasOpenedDiscovery: true,
                    tabsManager: {
                        currentTabId: null,
                        tabs: [],
                    },
                },
            }

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>{children}</TestWrapper>
            )

            const { result } = renderHook(() => useDappBookmarkToggle("https://custom.com", "Custom Site"), {
                wrapper,
            })

            expect(result.current.isBookMarked).toBe(true)
            expect(result.current.existingBookmark?.isCustom).toBe(true)
        })
    })

    describe("toggleBookmark action", () => {
        beforeEach(() => {
            mockDispatch.mockClear()
        })

        it("should dispatch addBookmark with VBD app when toggling bookmark for an existing VBD app", async () => {
            useDappBookmarksList.mockReturnValue([])
            useVeBetterDaoDapps.mockReturnValue({ data: mockVbdDapps, isLoading: false })

            const preloadedState = {
                discovery: {
                    featured: [],

                    favoriteRefs: [],
                    custom: [],
                    bannerInteractions: {},
                    connectedApps: [],
                    hasOpenedDiscovery: true,
                    tabsManager: {
                        currentTabId: null,
                        tabs: [],
                    },
                },
            }

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>{children}</TestWrapper>
            )

            const { result } = renderHook(() => useDappBookmarkToggle("https://vbdapp.com", "VBD App"), {
                wrapper,
            })

            await result.current.toggleBookmark()

            expect(mockDispatch).toHaveBeenCalled()
            const addBookmarkCall = mockDispatch.mock.calls.find(call => call[0].type === "discovery/addBookmark")
            expect(addBookmarkCall).toBeDefined()
            expect(addBookmarkCall[0].payload).toEqual(mockVbdDapps[0])
        })

        it("should dispatch addBookmark with featured app when toggling an existing featured app", async () => {
            useDappBookmarksList.mockReturnValue([])
            useVeBetterDaoDapps.mockReturnValue({ data: [], isLoading: false })

            const preloadedState = {
                discovery: {
                    featured: mockFeaturedDapps,

                    favoriteRefs: [],
                    custom: [],
                    bannerInteractions: {},
                    connectedApps: [],
                    hasOpenedDiscovery: true,
                    tabsManager: {
                        currentTabId: null,
                        tabs: [],
                    },
                },
            }

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>{children}</TestWrapper>
            )

            const { result } = renderHook(() => useDappBookmarkToggle("https://mugshot2.vet", "Mugshot"), {
                wrapper,
            })

            await result.current.toggleBookmark()

            expect(mockDispatch).toHaveBeenCalled()
            const addBookmarkCall = mockDispatch.mock.calls.find(call => call[0].type === "discovery/addBookmark")
            expect(addBookmarkCall).toBeDefined()
            expect(addBookmarkCall[0].payload).toEqual(mockFeaturedDapps[0])
        })
    })
})
