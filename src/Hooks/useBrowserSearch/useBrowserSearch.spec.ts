import { renderHook } from "@testing-library/react-hooks"
import { useBrowserSearch } from "./useBrowserSearch"
import { TestWrapper } from "~Test"
import { useVisitedUrls } from "./useVisitedUrls"
import { HistoryDappItem, HistoryUrlItem, HistoryUrlKind } from "~Utils/HistoryUtils"

jest.mock("~Utils/URIUtils")
jest.mock("~Navigation")
jest.mock("./useVisitedUrls")

describe("useBrowserSearch", () => {
    it("should return all the results with empty string", () => {
        ;(useVisitedUrls as jest.Mock).mockResolvedValueOnce({
            addVisitedUrl: jest.fn(),
        })
        const { result } = renderHook(() => useBrowserSearch(""), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    browser: {
                        visitedUrls: [
                            {
                                amountOfNavigations: 0,
                                createAt: Date.now(),
                                href: new URL("https://vechain.org").origin,
                                isCustom: true,
                                name: "Vechain",
                            },
                        ],
                    },
                    discovery: {
                        custom: [],
                        featured: [],
                        favorites: [],
                        hasOpenedDiscovery: false,
                        connectedApps: [],
                    },
                },
            },
        })
        expect(result.current.results).toBeDefined()
        expect(result.current.results).toHaveLength(1)
        expect(result.current.results[0].type).toBe(HistoryUrlKind.URL)
        expect((result.current.results[0] as HistoryUrlItem).url).toBe(new URL("https://vechain.org").origin)
    })
    it("should return filtered result with not empty string ignore-case", () => {
        ;(useVisitedUrls as jest.Mock).mockResolvedValueOnce({
            addVisitedUrl: jest.fn(),
        })
        const { result } = renderHook(() => useBrowserSearch("vechain"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    browser: {
                        visitedUrls: [
                            {
                                amountOfNavigations: 0,
                                createAt: Date.now(),
                                href: new URL("https://vechain.org").origin,
                                isCustom: true,
                                name: "Vechain",
                            },
                            {
                                amountOfNavigations: 0,
                                createAt: Date.now(),
                                href: new URL("https://testnet.vechain.org").origin,
                                isCustom: true,
                                name: "Testnet Node",
                            },
                        ],
                    },
                    discovery: {
                        custom: [],
                        featured: [],
                        favorites: [],
                        hasOpenedDiscovery: false,
                        connectedApps: [],
                    },
                },
            },
        })
        expect(result.current.results).toBeDefined()
        expect(result.current.results).toHaveLength(2)
        expect(result.current.results[0].type).toBe(HistoryUrlKind.URL)
        expect((result.current.results[0] as HistoryUrlItem).url).toBe(new URL("https://testnet.vechain.org").origin)
        expect(result.current.results[1].type).toBe(HistoryUrlKind.URL)
        expect((result.current.results[1] as HistoryUrlItem).url).toBe(new URL("https://vechain.org").origin)
    })
    it("should filter visited urls by name or url", () => {
        ;(useVisitedUrls as jest.Mock).mockResolvedValueOnce({
            addVisitedUrl: jest.fn(),
        })
        const { result } = renderHook(() => useBrowserSearch("vechain"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    browser: {
                        visitedUrls: [
                            {
                                amountOfNavigations: 0,
                                createAt: Date.now(),
                                href: new URL("https://google.com").origin,
                                isCustom: true,
                                name: "Vechain",
                            },
                            {
                                amountOfNavigations: 0,
                                createAt: Date.now(),
                                href: new URL("https://testnet.vechain.org").origin,
                                isCustom: true,
                                name: "Not what you'd expect",
                            },
                        ],
                    },
                    discovery: {
                        custom: [],
                        featured: [],
                        favorites: [],
                        hasOpenedDiscovery: false,
                        connectedApps: [],
                    },
                },
            },
        })
        expect(result.current.results).toBeDefined()
        expect(result.current.results).toHaveLength(2)
        expect(result.current.results[0].type).toBe(HistoryUrlKind.URL)
        expect((result.current.results[0] as HistoryUrlItem).url).toBe(new URL("https://testnet.vechain.org").origin)
        expect(result.current.results[1].type).toBe(HistoryUrlKind.URL)
        expect((result.current.results[1] as HistoryUrlItem).url).toBe(new URL("https://google.com").origin)
    })

    it("should filter dapps by name or description", () => {
        ;(useVisitedUrls as jest.Mock).mockResolvedValueOnce({
            addVisitedUrl: jest.fn(),
        })
        const { result } = renderHook(() => useBrowserSearch("vechain"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    browser: {
                        visitedUrls: [
                            {
                                amountOfNavigations: 0,
                                createAt: Date.now(),
                                href: new URL("https://testnet.vechain.org").origin,
                                isCustom: false,
                                name: "TEST",
                            },
                            {
                                amountOfNavigations: 0,
                                createAt: Date.now(),
                                href: new URL("https://google.com").origin,
                                isCustom: false,
                                name: "TEST 2",
                            },
                        ],
                    },
                    discovery: {
                        custom: [
                            {
                                amountOfNavigations: 0,
                                createAt: Date.now(),
                                href: new URL("https://testnet.vechain.org").origin,
                                isCustom: false,
                                name: "Not what you'd expect",
                                desc: "Vechain",
                            },
                            {
                                amountOfNavigations: 0,
                                createAt: Date.now(),
                                href: new URL("https://google.com").origin,
                                isCustom: false,
                                name: "Vechain",
                            },
                        ],
                        featured: [],
                        favorites: [],
                        hasOpenedDiscovery: false,
                        connectedApps: [],
                    },
                },
            },
        })
        expect(result.current.results).toBeDefined()
        expect(result.current.results).toHaveLength(2)
        expect(result.current.results[0].type).toBe(HistoryUrlKind.DAPP)
        expect((result.current.results[0] as HistoryDappItem).dapp.href).toBe(new URL("https://google.com").origin)
        expect(result.current.results[1].type).toBe(HistoryUrlKind.DAPP)
        expect((result.current.results[1] as HistoryDappItem).dapp.href).toBe(
            new URL("https://testnet.vechain.org").origin,
        )
    })
})
