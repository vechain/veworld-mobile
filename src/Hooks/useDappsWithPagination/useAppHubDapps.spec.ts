import { renderHook } from "@testing-library/react-hooks"
import { useAppHubDapps } from "./useAppHubDapps"
import { DAppType } from "~Model"
import { TestWrapper } from "~Test"
import { DiscoveryDApp } from "~Constants"
import moment from "moment"
import { useVeBetterDaoActiveDapps, useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"

const buildDapp = (overrides?: Partial<DiscoveryDApp>): DiscoveryDApp => {
    return {
        amountOfNavigations: 0,
        createAt: Date.now(),
        isCustom: true,
        name: "TEST DAPP",
        href: new URL("https://vechain.org").origin,
        ...overrides,
    }
}

const createInitialProps = (...dapps: DiscoveryDApp[]) => ({
    preloadedState: {
        discovery: {
            custom: [],
            featured: dapps,
            favorites: [],
            hasOpenedDiscovery: false,
            connectedApps: [],
            bannerInteractions: {},
            tabsManager: {
                currentTabId: null,
                tabs: [],
            },
        },
    },
})

describe("useAppHubDapps", () => {
    beforeAll(() => {
        ;(useVeBetterDaoDapps as jest.Mock).mockImplementation(() => ({
            data: [],
            isFetching: false,
        }))
    })

    it("should render correctly", async () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
        })
        const { result } = renderHook(() => useAppHubDapps(DAppType.ALL), {
            wrapper: TestWrapper,
            initialProps: createInitialProps(buildDapp({ name: "TEST DAPP" })),
        })

        expect(result.current).toEqual({
            dependencyLoading: false,
            fetchWithPage: expect.any(Function),
        })
    })

    it("should return hasMore = false if there are < 10 items", async () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
        })
        const { result } = renderHook(() => useAppHubDapps(DAppType.ALL), {
            wrapper: TestWrapper,
            initialProps: createInitialProps(buildDapp({ name: "TEST DAPP" })),
        })

        const res = await result.current.fetchWithPage({ page: 0, sort: "alphabetic_asc" })

        expect(res.hasMore).toBe(false)
        expect(res.page).toHaveLength(1)
    })

    it("should return hasMore = true if there are > 10 items", async () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
        })
        const { result } = renderHook(() => useAppHubDapps(DAppType.ALL), {
            wrapper: TestWrapper,
            initialProps: createInitialProps(
                ...Array.from({ length: 11 }, (_, idx) =>
                    buildDapp({ name: `TEST DAPP #${idx.toString().padStart(2, "0")}` }),
                ),
            ),
        })

        const res1 = await result.current.fetchWithPage({ page: 0, sort: "alphabetic_asc" })

        expect(res1.hasMore).toBe(true)
        expect(res1.page).toHaveLength(10)

        const res2 = await result.current.fetchWithPage({ page: 1, sort: "alphabetic_asc" })

        expect(res2.hasMore).toBe(false)
        expect(res2.page).toHaveLength(1)
        expect(res2.page[0].name).toBe("TEST DAPP #10")
    })

    it("Should sort by alphabetic_asc correctly", async () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
        })
        const { result } = renderHook(() => useAppHubDapps(DAppType.ALL), {
            wrapper: TestWrapper,
            initialProps: createInitialProps(buildDapp({ name: "b" }), buildDapp({ name: "A" })),
        })

        const res = await result.current.fetchWithPage({ page: 0, sort: "alphabetic_asc" })

        expect(res.page[0].name).toBe("A")
        expect(res.page[1].name).toBe("b")
    })

    it("Should sort by alphabetic_desc correctly", async () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
        })
        const { result } = renderHook(() => useAppHubDapps(DAppType.ALL), {
            wrapper: TestWrapper,
            initialProps: createInitialProps(buildDapp({ name: "A" }), buildDapp({ name: "b" })),
        })

        const res = await result.current.fetchWithPage({ page: 0, sort: "alphabetic_desc" })

        expect(res.page[0].name).toBe("b")
        expect(res.page[1].name).toBe("A")
    })

    it("Should sort by newest correctly", async () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
        })
        const { result } = renderHook(() => useAppHubDapps(DAppType.ALL), {
            wrapper: TestWrapper,
            initialProps: createInitialProps(
                buildDapp({ createAt: moment().subtract(1, "day").valueOf(), name: "Should be last" }),
                buildDapp({ createAt: Date.now(), name: "Should be first" }),
            ),
        })

        const res = await result.current.fetchWithPage({ page: 0, sort: "newest" })

        expect(res.page[0].name).toBe("Should be first")
        expect(res.page[1].name).toBe("Should be last")
    })

    it("Should return only VBD active apps from SUSTAINABILITY filter", async () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [{ id: "0x01" }],
        })
        const { result } = renderHook(() => useAppHubDapps(DAppType.SUSTAINABILTY), {
            wrapper: TestWrapper,
            initialProps: createInitialProps(
                buildDapp({
                    createAt: moment().subtract(1, "day").valueOf(),
                    name: "Not active dapp",
                    tags: [DAppType.SUSTAINABILTY.toLowerCase()],
                    veBetterDaoId: "0x02",
                }),
                buildDapp({
                    createAt: Date.now(),
                    name: "VBD",
                    veBetterDaoId: "0x01",
                    tags: [DAppType.SUSTAINABILTY.toLowerCase()],
                }),
                buildDapp({
                    createAt: moment().subtract(1, "day").valueOf(),
                    name: "No VBD ID",
                    tags: [DAppType.SUSTAINABILTY.toLowerCase()],
                }),
                buildDapp({
                    createAt: moment().subtract(1, "day").valueOf(),
                    name: "Not active dapp + no sustainability tag",
                    veBetterDaoId: "0x03",
                }),
            ),
        })

        const res = await result.current.fetchWithPage({ page: 0, sort: "newest" })

        expect(res.page).toHaveLength(1)
        expect(res.page[0].name).toBe("VBD")
    })
})
