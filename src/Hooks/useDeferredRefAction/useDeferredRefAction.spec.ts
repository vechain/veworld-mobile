import { act, renderHook } from "@testing-library/react-hooks"
import { useDeferredRefAction } from "./useDeferredRefAction"

describe("useDeferredRefAction", () => {
    it("should initialize with null ref and not ready", () => {
        const { result } = renderHook(() => useDeferredRefAction<{ id: string }>())

        expect(result.current.ref.current).toBeNull()
        expect(result.current.isReady).toBe(false)
    })

    it("should execute action immediately when ref is ready", () => {
        const { result } = renderHook(() => useDeferredRefAction<{ id: string }>())
        const node = { id: "node-1" }
        const action = jest.fn()

        act(() => {
            result.current.setNodeRef(node)
        })

        act(() => {
            result.current.runWhenReady(action)
        })

        expect(action).toHaveBeenCalledTimes(1)
        expect(action).toHaveBeenCalledWith(node)
    })

    it("should defer action until ref becomes available", () => {
        const { result } = renderHook(() => useDeferredRefAction<{ id: string }>())
        const node = { id: "node-2" }
        const action = jest.fn()

        act(() => {
            result.current.runWhenReady(action)
        })

        expect(action).not.toHaveBeenCalled()

        act(() => {
            result.current.setNodeRef(node)
        })

        expect(action).toHaveBeenCalledTimes(1)
        expect(action).toHaveBeenCalledWith(node)
    })

    it("should keep only the latest pending action before ref is ready", () => {
        const { result } = renderHook(() => useDeferredRefAction<{ id: string }>())
        const node = { id: "node-3" }
        const firstAction = jest.fn()
        const secondAction = jest.fn()

        act(() => {
            result.current.runWhenReady(firstAction)
            result.current.runWhenReady(secondAction)
        })

        act(() => {
            result.current.setNodeRef(node)
        })

        expect(firstAction).not.toHaveBeenCalled()
        expect(secondAction).toHaveBeenCalledTimes(1)
        expect(secondAction).toHaveBeenCalledWith(node)
    })

    it("should set ready state based on node ref lifecycle", () => {
        const { result } = renderHook(() => useDeferredRefAction<{ id: string }>())
        const node = { id: "node-4" }

        act(() => {
            result.current.setNodeRef(node)
        })
        expect(result.current.isReady).toBe(true)

        act(() => {
            result.current.setNodeRef(null)
        })
        expect(result.current.isReady).toBe(false)
    })
})
