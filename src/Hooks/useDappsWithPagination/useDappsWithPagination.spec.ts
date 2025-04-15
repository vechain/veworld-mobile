import { renderHook } from "@testing-library/react-hooks"
import { useAppHubDapps } from "./useAppHubDapps"
import { useVbdDapps } from "./useVbdDapps"
import { useDappsWithPagination } from "./useDappsWithPagination"
import { DAppType } from "~Model"
import { TestWrapper } from "~Test"
import { useInfiniteQuery } from "@tanstack/react-query"

jest.mock("./useAppHubDapps")
jest.mock("./useVbdDapps")
jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useInfiniteQuery: jest.fn(),
}))

describe("useDappsWithPagination", () => {
    it("should render correctly", async () => {
        ;(useAppHubDapps as jest.Mock).mockReturnValueOnce({
            fetchWithPage: jest.fn(),
            dependencyLoading: false,
        })
        ;(useVbdDapps as jest.Mock).mockReturnValueOnce({ fetchWithPage: jest.fn(), dependencyLoading: false })
        ;(useInfiniteQuery as jest.Mock).mockReturnValueOnce({
            data: { pages: [] },
            isFetching: false,
            fetchNextPage: jest.fn(),
        })

        const { result } = renderHook(() => useDappsWithPagination({ sort: "alphabetic_asc", filter: DAppType.ALL }), {
            wrapper: TestWrapper,
        })

        expect(result.current).toStrictEqual({
            isLoading: false,
            data: [],
            fetchNextPage: expect.any(Function),
        })
    })

    it("should use isFetching prop for loading", async () => {
        ;(useAppHubDapps as jest.Mock).mockReturnValueOnce({
            fetchWithPage: jest.fn(),
            dependencyLoading: false,
        })
        ;(useVbdDapps as jest.Mock).mockReturnValueOnce({ fetchWithPage: jest.fn(), dependencyLoading: false })
        ;(useInfiniteQuery as jest.Mock).mockReturnValueOnce({
            data: { pages: [] },
            isFetching: true,
            fetchNextPage: jest.fn(),
        })

        const { result } = renderHook(() => useDappsWithPagination({ sort: "alphabetic_asc", filter: DAppType.ALL }), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it("should use useVbdDapps dependencyLoading prop for loading when filter is SUSTAINABILITY", async () => {
        ;(useAppHubDapps as jest.Mock).mockReturnValueOnce({
            fetchWithPage: jest.fn(),
            dependencyLoading: false,
        })
        ;(useVbdDapps as jest.Mock).mockReturnValueOnce({ fetchWithPage: jest.fn(), dependencyLoading: true })
        ;(useInfiniteQuery as jest.Mock).mockReturnValueOnce({
            data: { pages: [] },
            isFetching: false,
            fetchNextPage: jest.fn(),
        })

        const { result } = renderHook(
            () => useDappsWithPagination({ sort: "alphabetic_asc", filter: DAppType.SUSTAINABILTY }),
            {
                wrapper: TestWrapper,
            },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it("should use useAppHubDapps dependencyLoading prop for loading when filter is not SUSTAINABILITY", async () => {
        ;(useAppHubDapps as jest.Mock).mockReturnValueOnce({
            fetchWithPage: jest.fn(),
            dependencyLoading: true,
        })
        ;(useVbdDapps as jest.Mock).mockReturnValueOnce({ fetchWithPage: jest.fn(), dependencyLoading: false })
        ;(useInfiniteQuery as jest.Mock).mockReturnValueOnce({
            data: { pages: [] },
            isFetching: false,
            fetchNextPage: jest.fn(),
        })

        const { result } = renderHook(() => useDappsWithPagination({ sort: "alphabetic_asc", filter: DAppType.ALL }), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })
})
