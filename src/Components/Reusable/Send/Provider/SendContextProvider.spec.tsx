import React from "react"
import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper, TestHelpers } from "~Test"
import { SendContextProvider, useSendContext } from "./SendContextProvider"
import { RootState } from "~Storage/Redux/Types"

const { VETWithBalance } = TestHelpers.data

const createWrapper = (preloadedState: Partial<RootState>) => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestWrapper preloadedState={preloadedState}>
            <SendContextProvider>{children}</SendContextProvider>
        </TestWrapper>
    )
}

describe("SendContextProvider", () => {
    it("should render the component", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.flowState).toMatchObject({
            token: undefined,
            amount: "0",
            fiatAmount: "",
            address: "",
            amountInFiat: false,
        })
    })

    it("should update the flow state", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        result.current.setFlowState({
            token: VETWithBalance,
            amount: "1",
            address: "0x1234567890123456789012345678901234567890",
        })

        expect(result.current.flowState.token).not.toBeUndefined()
        expect(result.current.flowState.token?.symbol).toEqual(VETWithBalance.symbol)
        expect(result.current.flowState.amount).toBe("1")
        expect(result.current.flowState.address).toBe("0x1234567890123456789012345678901234567890")
    })

    it("should update the step", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.step).toBe("selectAmount")

        result.current.goToNext()

        expect(result.current.step).toBe("insertAddress")
    })

    it("should update the previous step", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.step).toBe("selectAmount")
        result.current.goToNext()
        expect(result.current.step).toBe("insertAddress")
        result.current.goToPrevious()
        expect(result.current.step).toBe("selectAmount")
    })
    it("should update the isNextButtonEnabled state", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.isNextButtonEnabled).toBe(true)
        result.current.setIsNextButtonEnabled(false)
        expect(result.current.isNextButtonEnabled).toBe(false)
    })

    it("should update the isPreviousButtonEnabled state", () => {
        const { result } = renderHook(() => useSendContext(), {
            wrapper: createWrapper({}),
        })

        expect(result.current.isPreviousButtonEnabled).toBe(true)
        result.current.setIsPreviousButtonEnabled(false)
        expect(result.current.isPreviousButtonEnabled).toBe(false)
    })
})
