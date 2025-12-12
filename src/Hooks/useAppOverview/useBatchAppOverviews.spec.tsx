import { renderHook } from "@testing-library/react-hooks"
import { waitFor } from "@testing-library/react-native"
import { TestWrapper } from "~Test"

import { useBatchAppOverviews } from "./useBatchAppOverviews"

const indexerGet = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useMainnetIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => indexerGet(...args).then((res: any) => ({ data: res })),
    }),
}))

const createMockResponse = (appId: string) => ({
    entity: appId,
    totalUniqueUserInteractions: 2500,
    actionsRewarded: 1250,
})

describe("useBatchAppOverviews", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should fetch multiple app overviews successfully", async () => {
        const appIds = ["app-1", "app-2"]
        const responses = appIds.map(createMockResponse)

        indexerGet.mockResolvedValueOnce(responses[0] as any).mockResolvedValueOnce(responses[1] as any)

        const { result } = renderHook(() => useBatchAppOverviews(appIds), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.overviews["app-1"]).toEqual(responses[0])
            expect(result.current.overviews["app-2"]).toEqual(responses[1])
        })

        expect(indexerGet).toHaveBeenCalledTimes(2)
    })

    it("should handle empty appIds array", () => {
        const { result } = renderHook(() => useBatchAppOverviews([]), {
            wrapper: TestWrapper,
        })

        expect(result.current.overviews).toEqual({})
        expect(indexerGet).not.toHaveBeenCalled()
    })

    it("should not fetch when disabled", () => {
        const { result } = renderHook(() => useBatchAppOverviews(["app-1"], false), {
            wrapper: TestWrapper,
        })

        expect(result.current.overviews).toEqual({})
        expect(indexerGet).not.toHaveBeenCalled()
    })
})
