import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useTokenURI } from "./useTokenURI"

import { useCollectibleMetadata } from "./useCollectibleMetadata"

const getIpfsValue = jest.fn()
const getArweaveValue = jest.fn()
const getHttpsValue = jest.fn()

jest.mock("./useTokenURI", () => ({
    useTokenURI: jest.fn(),
}))

jest.mock("~Utils/IPFSUtils", () => ({
    getIpfsQueryKeyOptions: jest.fn().mockImplementation((...args) => ({
        ...jest.requireActual("~Utils/IPFSUtils").default.getIpfsQueryKeyOptions(...args),
        queryFn: () => getIpfsValue(),
    })),
}))
jest.mock("~Utils/ArweaveUtils", () => ({
    getArweaveQueryKeyOptions: jest.fn().mockImplementation((...args) => ({
        ...jest.requireActual("~Utils/ArweaveUtils").default.getArweaveQueryKeyOptions(...args),
        queryFn: () => getArweaveValue(),
    })),
}))
jest.mock("axios", () => ({
    ...jest.requireActual("axios"),
    get: () => getHttpsValue(),
}))

describe("useCollectibleMetadata", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should call IPFS if URI is IPFS", async () => {
        ;(useTokenURI as jest.Mock).mockReturnValue({ isLoading: false, data: "ipfs://test1" })
        ;(getIpfsValue as jest.Mock).mockResolvedValue({ name: "TEST1" })
        const { result, waitFor } = renderHook(() => useCollectibleMetadata({ address: "0x0", tokenId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data?.name).toBe("TEST1")
        })
    })
    it("should call Arweave if URI is Arweave", async () => {
        ;(useTokenURI as jest.Mock).mockReturnValue({ isLoading: false, data: "ar://test1" })
        ;(getArweaveValue as jest.Mock).mockResolvedValue({ name: "TEST2" })
        const { result, waitFor } = renderHook(() => useCollectibleMetadata({ address: "0x0", tokenId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data?.name).toBe("TEST2")
        })
    })
    it("should call url if URI is HTTPS", async () => {
        ;(useTokenURI as jest.Mock).mockReturnValue({ isLoading: false, data: "https://google.com" })
        ;(getHttpsValue as jest.Mock).mockResolvedValue({ data: { name: "TEST3" } })
        const { result, waitFor } = renderHook(() => useCollectibleMetadata({ address: "0x0", tokenId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data?.name).toBe("TEST3")
        })
    })
    it("should call url if URI is HTTP", async () => {
        ;(useTokenURI as jest.Mock).mockReturnValue({ isLoading: false, data: "http://google.com" })
        ;(getHttpsValue as jest.Mock).mockResolvedValue({ data: { name: "TEST4" } })
        const { result, waitFor } = renderHook(() => useCollectibleMetadata({ address: "0x0", tokenId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data?.name).toBe("TEST4")
        })
    })
    it("should lowercase keys", async () => {
        ;(useTokenURI as jest.Mock).mockReturnValue({ isLoading: false, data: "http://google.com" })
        ;(getHttpsValue as jest.Mock).mockResolvedValue({ data: { NaMe: "TEST5" } })
        const { result, waitFor } = renderHook(() => useCollectibleMetadata({ address: "0x0", tokenId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data?.name).toBe("TEST5")
        })
    })
    it("should return undefined data if unknown", () => {
        ;(useTokenURI as jest.Mock).mockReturnValue({ isLoading: false, data: undefined })
        const { result } = renderHook(() => useCollectibleMetadata({ address: "0x0", tokenId: "1" }), {
            wrapper: TestWrapper,
        })

        expect(result.current.data).not.toBeDefined()
        expect(result.current.isLoading).toBe(false)
    })
})
