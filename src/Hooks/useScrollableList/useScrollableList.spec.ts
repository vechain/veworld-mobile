import { act, renderHook } from "@testing-library/react-hooks"
import { useScrollableList } from "./useScrollableList"

describe("useScrollableList", () => {
    it("should return correct state and configuration", () => {
        const data = [1, 2, 3, 4, 5]
        const snapIndex = 2
        const snapPointsLength = 5
        const { result } = renderHook(() =>
            useScrollableList(data, snapIndex, snapPointsLength),
        )

        expect(result.current.isListScrollable).toBe(false)
        expect(result.current.viewabilityConfig).toEqual({
            itemVisiblePercentThreshold: 100,
        })
        act(() =>
            result.current.onViewableItemsChanged({
                viewableItems: [],
                changed: [],
            }),
        )
        expect(result.current.visibleItemsCount).toEqual(0)
    })
    it("should be scrollable", () => {
        const data = [1, 2, 3, 4, 5]
        const snapIndex = 4
        const snapPointsLength = 5
        const { result } = renderHook(() =>
            useScrollableList(data, snapIndex, snapPointsLength),
        )
        act(() =>
            result.current.onViewableItemsChanged({
                viewableItems: [],
                changed: [],
            }),
        )
        expect(result.current.isListScrollable).toBe(true)
    })
})
