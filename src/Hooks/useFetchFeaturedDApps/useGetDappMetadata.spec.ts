import { renderHook } from "@testing-library/react-hooks"
import { useGetDappMetadataFromUrl } from "./useGetDappMetadata"
import { TestWrapper } from "~Test"
import { DiscoveryDApp } from "~Constants"
import { DiscoveryState } from "~Storage/Redux"

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
        href: "https://mugshot.vet",
        name: "Mugshot",
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
        bannerInteractions: {},
        favoriteRefs: [],
        tabsManager: {
            currentTabId: null,
            tabs: [],
        },
    } satisfies DiscoveryState,
}

describe("useGetDappMetadata", () => {
    it("should return the dapp metadata", () => {
        const { result } = renderHook(() => useGetDappMetadataFromUrl("https://mugshot.vet"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        ...mockState.discovery,
                        favorites: [],
                        favoriteRefs: [],
                    },
                },
            },
        })
        expect(result.current?.href).toBe("https://mugshot.vet")
    })

    it("should return undefined if the dapp is not found", () => {
        const { result } = renderHook(() => useGetDappMetadataFromUrl("https://www.mugshot3.vet"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        ...mockState.discovery,
                        favorites: [],
                        favoriteRefs: [],
                    },
                },
            },
        })
        expect(result.current).toBeUndefined()
    })
})
