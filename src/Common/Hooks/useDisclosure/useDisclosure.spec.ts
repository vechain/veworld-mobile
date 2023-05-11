import { renderHook, act } from "@testing-library/react-hooks"
import { useDisclosure } from "./useDisclosure"

describe("useDisclosure", () => {
    it("default state should be closed", () => {
        const { result } = renderHook(() => useDisclosure())
        expect(result.current.isOpen).toBe(false)
    })

    it("onOpen should set isOpen to true", () => {
        const { result } = renderHook(() => useDisclosure())
        act(() => {
            result.current.onOpen()
        })
        expect(result.current.isOpen).toBe(true)
    })

    it("onClose should set isOpen to false", () => {
        const { result } = renderHook(() => useDisclosure(true))
        act(() => {
            result.current.onClose()
        })
        expect(result.current.isOpen).toBe(false)
    })

    it("onToggle should toggle isOpen", () => {
        const { result } = renderHook(() => useDisclosure(true))

        act(() => {
            result.current.onToggle()
        })
        expect(result.current.isOpen).toBe(false)

        act(() => {
            result.current.onToggle()
        })
        expect(result.current.isOpen).toBe(true)
    })

    it("shouldOpen should set isOpen to the provided value", () => {
        const { result } = renderHook(() => useDisclosure())

        act(() => {
            result.current.shouldOpen(true)
        })
        expect(result.current.isOpen).toBe(true)

        act(() => {
            result.current.shouldOpen(false)
        })
        expect(result.current.isOpen).toBe(false)
    })
})
