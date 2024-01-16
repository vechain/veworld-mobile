import React from "react"
import { renderHook, act } from "@testing-library/react-hooks"
import { useBottomSheet, useBottomSheetModal } from "./useBottomSheet"

describe("useBottomSheet", () => {
    it("should return ref, onOpen, onClose functions", () => {
        jest.spyOn(React, "useRef").mockReturnValue({
            current: {
                expand: jest.fn(),
                close: jest.fn(),
            },
        })
        const { result } = renderHook(() => useBottomSheet())
        expect(result.current.ref).toBeDefined()
        expect(result.current.onOpen).toBeDefined()
        act(() => {
            result.current.onOpen()
        })
        expect(result.current.ref.current?.expand).toBeCalled()
        expect(result.current.onClose).toBeDefined()
        act(() => {
            result.current.onClose()
        })
        expect(result.current.ref.current?.close).toBeCalled()
    })
})

describe("useBottomSheetModal", () => {
    it("should return ref, onOpen, onClose, openWithDelay functions", () => {
        jest.spyOn(React, "useRef").mockReturnValue({
            current: {
                present: jest.fn(),
                close: jest.fn(),
            },
        })
        const { result } = renderHook(() => useBottomSheetModal())
        expect(result.current.ref).toBeDefined()
        expect(result.current.onOpen).toBeDefined()
        act(() => {
            result.current.onOpen()
        })
        expect(result.current.ref.current?.present).toBeCalled()
        expect(result.current.onClose).toBeDefined()
        act(() => {
            result.current.onClose()
        })
        expect(result.current.ref.current?.close).toBeCalled()
        expect(result.current.openWithDelay).toBeDefined()
    })

    it("should call present function after specified delay", async () => {
        jest.spyOn(React, "useRef").mockReturnValue({
            current: {
                present: jest.fn(),
            },
        })
        jest.useFakeTimers()
        jest.spyOn(global, "setTimeout")
        const { result } = renderHook(() => useBottomSheetModal())
        act(() => {
            result.current.openWithDelay(1000)
        })
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)
        jest.advanceTimersByTime(1000)
        expect(result.current.ref.current?.present).toHaveBeenCalledTimes(1)
        jest.useRealTimers()
    })
})
