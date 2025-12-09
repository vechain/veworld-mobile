import React from "react"
import { renderHook, act } from "@testing-library/react-hooks"
import { TestWrapper, TestHelpers } from "~Test"
import { SendNFTContextProvider } from "./SendNFTContextProvider"
import { useSendContext } from "./SendContextProvider"
import { RootState } from "~Storage/Redux/Types"

const { NFT_Mock } = TestHelpers.data

const createWrapper = (preloadedState: Partial<RootState>, initialNft?: typeof NFT_Mock) => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestWrapper preloadedState={preloadedState}>
            <SendNFTContextProvider initialNft={initialNft}>{children}</SendNFTContextProvider>
        </TestWrapper>
    )
}

describe("SendNFTContextProvider", () => {
    it("should render with initial state", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.flowState).toMatchObject({
            type: "nft",
            address: "",
        })
        expect(result.current.step).toBe("insertAddress")
    })

    it("should render with initial NFT", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}, NFT_Mock),
        })

        expect(result.current.flowState).toMatchObject({
            type: "nft",
        })

        if (result.current.flowState.type === "nft") {
            expect(result.current.flowState.nft).not.toBeUndefined()
            expect(result.current.flowState.nft.tokenId).toEqual(NFT_Mock.tokenId)
            expect(result.current.flowState.nft.address).toEqual(NFT_Mock.address)
        }
    })

    it("should update the flow state", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}, NFT_Mock),
        })

        act(() => {
            result.current.setFlowState(prev => ({
                ...prev,
                address: "0x1234567890123456789012345678901234567890",
            }))
        })

        expect(result.current.flowState.address).toBe("0x1234567890123456789012345678901234567890")
    })

    it("should navigate from insertAddress to summary", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.step).toBe("insertAddress")

        act(() => {
            result.current.goToNext()
        })

        expect(result.current.step).toBe("summary")
    })

    it("should navigate from summary back to insertAddress", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.step).toBe("insertAddress")

        act(() => {
            result.current.goToNext()
        })

        expect(result.current.step).toBe("summary")

        act(() => {
            result.current.goToPrevious()
        })

        expect(result.current.step).toBe("insertAddress")
    })

    it("should not change step when goToPrevious is called on insertAddress", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.step).toBe("insertAddress")

        act(() => {
            result.current.goToPrevious()
        })

        expect(result.current.step).toBe("insertAddress")
    })

    it("should not change step when goToNext is called on summary", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        act(() => {
            result.current.goToNext()
        })

        expect(result.current.step).toBe("summary")

        act(() => {
            result.current.goToNext()
        })

        expect(result.current.step).toBe("summary")
    })
})
