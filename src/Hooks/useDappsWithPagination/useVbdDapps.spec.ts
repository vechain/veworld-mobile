import { renderHook } from "@testing-library/react-hooks"
import { useVbdDapps } from "./useVbdDapps"
import { TestWrapper } from "~Test"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { VeBetterDaoDapp } from "~Model"
import axios from "axios"
import { URIUtils } from "~Utils"
import { DiscoveryDApp } from "~Constants"
import { randomBytes } from "node:crypto"

jest.mock("axios")

const buildVbdDapp = (overrides?: Partial<VeBetterDaoDapp>): VeBetterDaoDapp => ({
    createdAtTimestamp: new Date().toISOString(),
    id: "VBD_ID",
    metadataURI: `baf${randomBytes(3).toString("hex").toLowerCase()}`,
    name: "VBD DAPP",
    teamWalletAddress: "0x0",
    appAvailableForAllocationVoting: true,
    ...overrides,
})

const buildAppHubDapp = (overrides?: Partial<DiscoveryDApp>): DiscoveryDApp => {
    return {
        amountOfNavigations: 0,
        createAt: Date.now(),
        isCustom: true,
        name: "TEST DAPP",
        href: new URL("https://vechain.org").origin,
        ...overrides,
    }
}

describe("useVbdDapps", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })
    afterEach(() => {
        ;(axios.get as jest.Mock).mockRestore()
    })
    it("should render correctly", async () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })
        const { result } = renderHook(() => useVbdDapps(false), {
            wrapper: TestWrapper,
        })

        expect(result.current).toEqual({
            dependencyLoading: expect.any(Boolean),
            fetchWithPage: expect.any(Function),
        })
    })

    it("should grab metadata from ipfs if app is not on app hub", async () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: [buildVbdDapp({ name: "TEST DAPP", id: "VBD_ID" })],
            isFetching: false,
        })
        const { result } = renderHook(() => useVbdDapps(true), {
            wrapper: TestWrapper,
        })

        ;(axios.get as jest.Mock).mockResolvedValueOnce({
            data: {
                logo: "ipfs://baf1",
                name: "TEST DAPP MD",
                external_url: "https://vechain.org",
            },
        })

        const res = await result.current.fetchWithPage({ page: 0, sort: "alphabetic_asc" })

        expect(res.hasMore).toBe(false)
        expect(res.page).toHaveLength(1)
        expect(axios.get).toHaveBeenCalled()
        expect(res.page[0].name).toBe("TEST DAPP MD")
        expect(res.page[0].veBetterDaoId).toBe("VBD_ID")
        expect(res.page[0].iconUri).toBe(URIUtils.convertUriToUrl("ipfs://baf1"))
    })

    it("should return the discovery dapp if app is on app hub", async () => {
        const dapp = buildVbdDapp({ name: "TEST DAPP", id: "VBD_ID_TEST" })
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: [dapp],
            isFetching: false,
        })
        const { result } = renderHook(() => useVbdDapps(true), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        connectedApps: [],
                        custom: [],
                        featured: [
                            buildAppHubDapp({ veBetterDaoId: "VBD_ID_TEST", name: "APP HUB DAPP", id: "APP_HUB_ID" }),
                        ],
                        favorites: [],
                        hasOpenedDiscovery: true,
                        bannerInteractions: {},
                        tabsManager: {
                            currentTabId: null,
                            tabs: [],
                        },
                    },
                },
            },
        })

        const res = await result.current.fetchWithPage({ page: 0, sort: "alphabetic_asc" })

        expect(res.hasMore).toBe(false)
        expect(res.page).toHaveLength(1)
        expect(axios.get).not.toHaveBeenCalled()
        expect(res.page[0].name).toBe("APP HUB DAPP")
        expect(res.page[0].veBetterDaoId).toBe("VBD_ID_TEST")
        expect(res.page[0].id).toBe("APP_HUB_ID")
        expect(res.page[0].iconUri).not.toBeDefined()
    })

    it("should return hasMore = false if there are < 10 items", async () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: [buildVbdDapp({ name: "TEST DAPP", id: "VBD_ID" })],
            isFetching: false,
        })
        const { result } = renderHook(() => useVbdDapps(true), {
            wrapper: TestWrapper,
        })

        ;(axios.get as jest.Mock).mockResolvedValueOnce({
            data: {
                logo: "ipfs://baf1",
                name: "TEST DAPP MD",
                external_url: "https://vechain.org",
            },
        })

        const res = await result.current.fetchWithPage({ page: 0, sort: "alphabetic_asc" })

        expect(res.hasMore).toBe(false)
        expect(res.page).toHaveLength(1)
        expect(axios.get).toHaveBeenCalledTimes(1)
    })

    it("should return hasMore = true if there are > 10 items", async () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: Array.from({ length: 11 }, (_, idx) =>
                buildVbdDapp({ name: `TEST DAPP #${idx.toString().padStart(2, "0")}`, id: "VBD_ID" }),
            ),
            isFetching: false,
        })
        const { result } = renderHook(() => useVbdDapps(true), {
            wrapper: TestWrapper,
        })

        const mockData = {
            data: {
                logo: "ipfs://baf1",
                external_url: "https://vechain.org",
            },
        }

        ;(axios.get as jest.Mock).mockResolvedValue(mockData)

        const res1 = await result.current.fetchWithPage({ page: 0, sort: "alphabetic_asc" })

        expect(res1.hasMore).toBe(true)
        expect(res1.page).toHaveLength(10)

        const res2 = await result.current.fetchWithPage({ page: 1, sort: "alphabetic_asc" })

        expect(res2.hasMore).toBe(false)
        expect(res2.page).toHaveLength(1)
        expect(res2.page[0].name).toBe("TEST DAPP #10")
    })

    it("should return dependencyLoading = true if fetching from contract", async () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })
        const { result } = renderHook(() => useVbdDapps(true), {
            wrapper: TestWrapper,
        })

        expect(result.current.dependencyLoading).toBe(true)
    })
})
