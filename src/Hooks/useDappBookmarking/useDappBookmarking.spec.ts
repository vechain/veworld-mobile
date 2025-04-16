import { renderHook, act } from "@testing-library/react-hooks"
import { useDappBookmarking } from "./useDappBookmarking"
import { TestWrapper } from "~Test"
import { DiscoveryDApp } from "~Constants"

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
        href: "https://example.com",
        name: "Example",
        isCustom: false,
        createAt: Date.now(),
        amountOfNavigations: 2,
    },
    {
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
    },
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

    it("should handle invalid URL", () => {
        const { result } = renderHook(() => useDappBookmarking(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        ...mockState.discovery,
                        favorites: [
                            {
                                href: "https::example.com",
                                name: "Example",
                                isCustom: false,
                                createAt: Date.now(),
                                amountOfNavigations: 2,
                            },
                        ],
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
