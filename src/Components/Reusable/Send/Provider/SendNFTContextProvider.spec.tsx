import React from "react"
import { renderHook, act } from "@testing-library/react-hooks"
import { TestWrapper, TestHelpers } from "~Test"
import { SendContextProvider, useSendContext } from "./SendContextProvider"
import { RootState } from "~Storage/Redux/Types"

const { NFT_Mock } = TestHelpers.data

const createWrapper = (preloadedState: Partial<RootState>, contractAddress: string = "0x0", tokenId: string = "0") => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestWrapper preloadedState={preloadedState}>
            <SendContextProvider
                initialFlowState={{
                    type: "nft",
                    contractAddress,
                    tokenId,
                    address: "",
                }}>
                {children}
            </SendContextProvider>
        </TestWrapper>
    )
}

describe("SendNFTContextProvider", () => {
    it("should render with initial state", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}, "0xcontract", "123"),
        })

        expect(result.current.flowState).toMatchObject({
            type: "nft",
            contractAddress: "0xcontract",
            tokenId: "123",
            address: "",
        })
        expect(result.current.step).toBe("insertAddress")
    })

    it("should render with initial NFT identifiers", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}, NFT_Mock.address, NFT_Mock.tokenId),
        })

        expect(result.current.flowState).toMatchObject({
            type: "nft",
        })

        if (result.current.flowState.type === "nft") {
            expect(result.current.flowState.contractAddress).toEqual(NFT_Mock.address)
            expect(result.current.flowState.tokenId).toEqual(NFT_Mock.tokenId)
        }
    })

    it("should update the flow state", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}, NFT_Mock.address, NFT_Mock.tokenId),
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
            wrapper: createWrapper({}, NFT_Mock.address, NFT_Mock.tokenId),
        })

        expect(result.current.step).toBe("insertAddress")

        act(() => {
            result.current.goToNext()
        })

        expect(result.current.step).toBe("summary")
    })

    it("should navigate from summary back to insertAddress", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}, NFT_Mock.address, NFT_Mock.tokenId),
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
            wrapper: createWrapper({}, NFT_Mock.address, NFT_Mock.tokenId),
        })

        expect(result.current.step).toBe("insertAddress")

        act(() => {
            result.current.goToPrevious()
        })

        expect(result.current.step).toBe("insertAddress")
    })

    it("should not change step when goToNext is called on summary", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}, NFT_Mock.address, NFT_Mock.tokenId),
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
