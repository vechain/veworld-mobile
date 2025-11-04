import { renderHook, act } from "@testing-library/react-hooks"
import { useDappBookmarking } from "./useDappBookmarking"
import { TestWrapper } from "~Test"
import { DiscoveryDApp } from "~Constants"
import { DiscoveryState } from "~Storage/Redux"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { VbdDApp } from "~Model"

const bookmarkedDapps: DiscoveryDApp[] = [
    {
        href: "https://example.com",
        name: "Example",
        isCustom: false,
        createAt: Date.now(),
        amountOfNavigations: 2,
    },
]

const featuredDapps: DiscoveryDApp[] = [
    {
        id: "https_example_com",
        href: "https://example.com",
        name: "Example",
        isCustom: false,
        createAt: Date.now(),
        amountOfNavigations: 2,
    },
    {
        id: "https_example2_com",
        href: "https://example2.com",
        name: "Example 2",
        isCustom: false,
        createAt: Date.now(),
        amountOfNavigations: 2,
    },
]

const customDapps: DiscoveryDApp[] = [
    {
        href: "https://example3.com",
        name: "Example 3",
        isCustom: true,
        createAt: Date.now(),
        amountOfNavigations: 3,
    },
    {
        href: "https://example4.com",
        name: "Example 4",
        isCustom: true,
        createAt: Date.now(),
        amountOfNavigations: 3,
    },
    {
        href: "https://example5.com",
        name: "Example 5",
        isCustom: true,
        createAt: Date.now(),
        amountOfNavigations: 3,
    },
]

const mockState = {
    discovery: {
        favorites: bookmarkedDapps,
        featured: featuredDapps,
        custom: customDapps,
        hasOpenedDiscovery: true,
        connectedApps: [],
        bannerInteractions: {},
        tabsManager: {
            currentTabId: null,
            tabs: [],
        },
    } satisfies DiscoveryState,
}

describe("useDappBookmarking", () => {
    it("should identify a bookmarked URL correctly", () => {
        const { result } = renderHook(() => useDappBookmarking("https://example.com", "Example"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: mockState.discovery,
                },
            },
        })
        expect(result.current.isBookMarked).toBe(true)
        expect(result.current.existingBookmark).toBeDefined()
        expect(result.current.existingBookmark?.href).toBe(bookmarkedDapps[0].href)
    })

    it("should identify a non-bookmarked URL correctly", () => {
        const { result } = renderHook(() => useDappBookmarking("https://notbookmarked.com"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        ...mockState.discovery,
                        favorites: [],
                    },
                },
            },
        })
        expect(result.current.isBookMarked).toBe(false)
        expect(result.current.existingBookmark).toBeUndefined()
    })

    it("should handle undefined URL gracefully", () => {
        const { result } = renderHook(() => useDappBookmarking(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        ...mockState.discovery,
                        favorites: [],
                    },
                },
            },
        })
        expect(result.current.isBookMarked).toBe(false)
        expect(result.current.existingBookmark).toBeUndefined()
    })

    it("should handle invalid URL gracefully", () => {
        const { result } = renderHook(() => useDappBookmarking("https::example.com"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        ...mockState.discovery,
                    },
                },
            },
        })

        expect(result.current.isBookMarked).toBe(false)
        expect(result.current.existingBookmark).toBeUndefined()
    })

    it("should match URLs with the same origin but different paths", () => {
        const { result } = renderHook(() => useDappBookmarking("https://example.com/some/path"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: mockState.discovery,
                },
            },
        })
        expect(result.current.isBookMarked).toBe(true)
        expect(result.current.existingBookmark).toBeDefined()
        expect(result.current.existingBookmark?.href).toBe(bookmarkedDapps[0].href)
    })

    it("should add a new bookmark when the URL is not in the list", async () => {
        const { result, waitFor } = renderHook(() => useDappBookmarking("https://example2.com", "Example 2"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: mockState.discovery,
                },
            },
        })

        await act(async () => {
            await result.current.toggleBookmark()
        })

        await waitFor(() => {
            expect(result.current.isBookMarked).toBe(true)
            expect(result.current.existingBookmark).toBeDefined()
            expect(result.current.existingBookmark?.href).toBe("https://example2.com")
        })
    })

    it("should add a bookmark from VBD", async () => {
        const vbdDApp = {
            app_urls: [],
            banner: "https://vechain.org",
            createdAtTimestamp: new Date().toISOString(),
            description: "DESC",
            external_url: "https://example2.com",
            id: "0x1",
            logo: "https://google.com",
            metadataURI: "ipfs://test1",
            name: "TEST NAME",
            screenshots: [],
            social_urls: [],
            teamWalletAddress: "0x0",
            appAvailableForAllocationVoting: true,
        } satisfies VbdDApp

        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: [vbdDApp],
            isLoading: false,
        })

        const { result, waitFor } = renderHook(() => useDappBookmarking("https://example2.com", "Example 2"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        ...mockState.discovery,
                        featured: [
                            ...featuredDapps,
                            {
                                id: "https_example2_com",
                                href: "https://example2.com",
                                name: "TEST NAME",
                                desc: "DESC",
                                isCustom: false,
                                createAt: Date.now(),
                                amountOfNavigations: 0,
                                veBetterDaoId: "0x1",
                            },
                        ],
                    },
                },
            },
        })

        await act(async () => {
            await result.current.toggleBookmark()
        })

        await waitFor(() => {
            expect(result.current.isBookMarked).toBe(true)
            expect(result.current.existingBookmark).toBeDefined()
            expect(result.current.existingBookmark?.href).toBe("https://example2.com")
        })
    })

    it("should add a bookmark from a generic URL", async () => {
        const { result, waitFor } = renderHook(() => useDappBookmarking("https://exampletest.com", "Example Test"), {
            wrapper: TestWrapper,
        })

        await act(async () => {
            await result.current.toggleBookmark()
        })

        await waitFor(() => {
            expect(result.current.isBookMarked).toBe(true)
            expect(result.current.existingBookmark).toBeDefined()
            expect(result.current.existingBookmark?.href).toBe("https://exampletest.com")
        })
    })

    it("should remove a bookmark when the URL is in the list", async () => {
        const { result, waitFor } = renderHook(() => useDappBookmarking("https://example.com", "Example"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: mockState.discovery,
                },
            },
        })

        await act(async () => {
            await result.current.toggleBookmark()
        })

        await waitFor(() => {
            expect(result.current.isBookMarked).toBe(false)
            expect(result.current.existingBookmark).toBeUndefined()
        })
    })
})
