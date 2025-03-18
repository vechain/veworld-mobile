import { act, renderHook } from "@testing-library/react-hooks"
import React from "react"
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

    it("should use passed ref for normal ops", async () => {
        const createdRef = {
            current: {
                present: jest.fn(),
                close: jest.fn(),
            },
        }
        const extRef = {
            current: {
                present: jest.fn(),
                close: jest.fn(),
            },
        }
        jest.spyOn(React, "useRef").mockReturnValue(createdRef)

        const { result } = renderHook(() => useBottomSheetModal({ externalRef: extRef as any }))
        expect(result.current.ref).toBeDefined()
        expect(result.current.ref).toBe(extRef)
        expect(result.current.onOpen).toBeDefined()
        act(() => {
            result.current.onOpen()
        })
        expect(createdRef.current?.present).not.toHaveBeenCalled()
        expect(extRef.current?.present).toHaveBeenCalled()
        expect(result.current.onClose).toBeDefined()
        act(() => {
            result.current.onClose()
        })
        expect(createdRef.current?.close).not.toHaveBeenCalled()
        expect(extRef.current?.close).toHaveBeenCalled()
        expect(result.current.openWithDelay).toBeDefined()
    })

    it("should use passed ref for openWithDelay", async () => {
        const createdRef = {
            current: {
                present: jest.fn(),
                close: jest.fn(),
            },
        }
        const extRef = {
            current: {
                present: jest.fn(),
                close: jest.fn(),
            },
        }
        jest.spyOn(React, "useRef").mockReturnValue(createdRef)
        jest.useFakeTimers()
        jest.spyOn(global, "setTimeout")
        const { result } = renderHook(() => useBottomSheetModal({ externalRef: extRef as any }))
        act(() => {
            result.current.openWithDelay(1000)
        })
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)
        jest.advanceTimersByTime(1000)
        expect(result.current.ref.current?.present).toHaveBeenCalledTimes(1)
        expect(createdRef.current?.present).not.toHaveBeenCalled()
        expect(extRef.current?.present).toHaveBeenCalled()
        jest.useRealTimers()
    })
})
