import { renderHook, act } from "@testing-library/react-hooks"
import React from "react"
import { RootState } from "~Storage/Redux/Types"
import { TestHelpers, TestWrapper } from "~Test"
import { SendContextProvider, useSendContext } from "./SendContextProvider"

const { VETWithBalance } = TestHelpers.data

const createWrapper = (preloadedState: Partial<RootState>) => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestWrapper preloadedState={preloadedState}>
            <SendContextProvider
                initialFlowState={{
                    type: "token",
                    token: undefined,
                    amount: "0",
                    fiatAmount: "",
                    address: "",
                    amountInFiat: false,
                }}>
                {children}
            </SendContextProvider>
        </TestWrapper>
    )
}

describe("SendContextProvider", () => {
    it("should render the component", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.flowState).toMatchObject({
            type: "token",
            token: undefined,
            amount: "0",
            fiatAmount: "",
            address: "",
        })
    })

    it("should update the flow state", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        act(() => {
            result.current.setFlowState({
                type: "token",
                token: VETWithBalance,
                amount: "1",
                address: "0x1234567890123456789012345678901234567890",
            })
        })

        if (result.current.flowState.type === "token") {
            expect(result.current.flowState.token).not.toBeUndefined()
            expect(result.current.flowState.token?.symbol).toEqual(VETWithBalance.symbol)
            expect(result.current.flowState.amount).toBe("1")
            expect(result.current.flowState.address).toBe("0x1234567890123456789012345678901234567890")
        }
    })

    it("should update the step", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.step).toBe("selectAmount")

        act(() => {
            result.current.goToNext()
        })

        expect(result.current.step).toBe("insertAddress")
    })

    it("should update the previous step", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.step).toBe("selectAmount")

        act(() => {
            result.current.goToNext()
        })

        expect(result.current.step).toBe("insertAddress")

        act(() => {
            result.current.goToPrevious()
        })

        expect(result.current.step).toBe("selectAmount")
    })
})
