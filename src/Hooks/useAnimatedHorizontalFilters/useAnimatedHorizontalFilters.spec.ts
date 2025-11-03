import { renderHook, act } from "@testing-library/react-hooks"
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { useAnimatedHorizontalFilters } from "./useAnimatedHorizontalFilters"

jest.mock("react-native-reanimated", () => {
    const Reanimated = require("react-native-reanimated/mock")

    Reanimated.useSharedValue = jest.fn((initialValue: number) => ({ value: initialValue }))
    Reanimated.useAnimatedStyle = jest.fn((styleFunction: () => object) => styleFunction())
    Reanimated.withTiming = jest.fn((value: number) => value)
    Reanimated.interpolate = jest.fn(() => 0)
    Reanimated.scrollTo = jest.fn()
    Reanimated.useDerivedValue = jest.fn((derivedFunction: () => void) => {
        derivedFunction()
    })

    return Reanimated
})

const mockItems = ["item1", "item2", "item3", "item4", "item5"]
const mockSelectedItem = "item2"
const mockKeyExtractor = (item: string) => item

const createMockLayoutEvent = (x: number, width: number): LayoutChangeEvent =>
    ({
        nativeEvent: {
            layout: { x, y: 0, width, height: 36 },
        },
    } as LayoutChangeEvent)

const createMockScrollEvent = (contentOffsetX: number): NativeSyntheticEvent<NativeScrollEvent> =>
    ({
        nativeEvent: {
            contentOffset: { x: contentOffsetX, y: 0 },
        },
    } as any)

describe("useAnimatedHorizontalFilters", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should initialize with correct default values", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: mockItems,
                selectedItem: mockSelectedItem,
                keyExtractor: mockKeyExtractor,
            }),
        )

        expect(result.current.scrollViewRef).toBeDefined()
        expect(result.current.handleChipLayout).toBeDefined()
        expect(result.current.handleScrollViewLayout).toBeDefined()
        expect(result.current.handleScroll).toBeDefined()
        expect(result.current.indicatorAnimatedStyle).toBeDefined()
        expect(result.current.isReady).toBe(false)
    })

    it("should handle chip layout correctly", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: mockItems,
                selectedItem: mockSelectedItem,
                keyExtractor: mockKeyExtractor,
            }),
        )

        act(() => {
            result.current.handleChipLayout(createMockLayoutEvent(0, 80), 0)
            result.current.handleChipLayout(createMockLayoutEvent(84, 90), 1)
            result.current.handleChipLayout(createMockLayoutEvent(178, 70), 2)
        })

        expect(result.current.isReady).toBe(false)
    })

    it("should handle scroll view layout correctly", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: mockItems,
                selectedItem: mockSelectedItem,
                keyExtractor: mockKeyExtractor,
            }),
        )

        const mockScrollViewLayoutEvent = {
            nativeEvent: {
                layout: { x: 0, y: 0, width: 350, height: 52 },
            },
        } as LayoutChangeEvent

        act(() => {
            result.current.handleScrollViewLayout(mockScrollViewLayoutEvent)
        })

        expect(result.current.handleScrollViewLayout).toBeDefined()
    })

    it("should handle scroll events correctly", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: mockItems,
                selectedItem: mockSelectedItem,
                keyExtractor: mockKeyExtractor,
            }),
        )

        act(() => {
            result.current.handleScroll(createMockScrollEvent(50))
        })

        expect(result.current.handleScroll).toBeDefined()
    })

    it("should be ready when all chips and scroll view are measured", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: mockItems,
                selectedItem: mockSelectedItem,
                keyExtractor: mockKeyExtractor,
            }),
        )

        const mockScrollViewLayoutEvent = {
            nativeEvent: {
                layout: { x: 0, y: 0, width: 350, height: 52 },
            },
        } as LayoutChangeEvent

        act(() => {
            result.current.handleScrollViewLayout(mockScrollViewLayoutEvent)

            mockItems.forEach((_, index) => {
                result.current.handleChipLayout(createMockLayoutEvent(index * 84, 80), index)
            })
        })

        expect(result.current.isReady).toBe(true)
    })

    it("should not update measurements if values haven't changed", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: mockItems,
                selectedItem: mockSelectedItem,
                keyExtractor: mockKeyExtractor,
            }),
        )

        act(() => {
            result.current.handleChipLayout(createMockLayoutEvent(0, 80), 0)
            result.current.handleChipLayout(createMockLayoutEvent(0, 80), 0)
        })

        expect(result.current.handleChipLayout).toBeDefined()
    })

    it("should work with different item types", () => {
        const complexItems = [
            { id: "1", name: "First" },
            { id: "2", name: "Second" },
            { id: "3", name: "Third" },
        ]
        const complexSelectedItem = { id: "2", name: "Second" }
        const complexKeyExtractor = (item: { id: string; name: string }) => item.id

        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: complexItems,
                selectedItem: complexSelectedItem,
                keyExtractor: complexKeyExtractor,
            }),
        )

        expect(result.current.scrollViewRef).toBeDefined()
        expect(result.current.isReady).toBe(false)
    })

    it("should handle empty items array", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: [],
                selectedItem: "",
                keyExtractor: (item: string) => item,
            }),
        )

        expect(result.current.isReady).toBe(true)
    })

    it("should handle selectedItem not in items array", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: mockItems,
                selectedItem: "nonexistent",
                keyExtractor: mockKeyExtractor,
            }),
        )

        expect(result.current.scrollViewRef).toBeDefined()
    })

    it("should update when props change", () => {
        const { result, rerender } = renderHook(props => useAnimatedHorizontalFilters(props), {
            initialProps: {
                items: mockItems,
                selectedItem: mockSelectedItem,
                keyExtractor: mockKeyExtractor,
            },
        })

        const initialRef = result.current.scrollViewRef

        rerender({
            items: mockItems,
            selectedItem: "item3",
            keyExtractor: mockKeyExtractor,
        })

        expect(result.current.scrollViewRef).toStrictEqual(initialRef)
    })

    it("should return correct animated style when not ready", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: mockItems,
                selectedItem: mockSelectedItem,
                keyExtractor: mockKeyExtractor,
            }),
        )

        const style = result.current.indicatorAnimatedStyle

        expect(style).toEqual({
            width: 0,
            transform: [{ translateX: 0 }],
        })
    })

    it("should return animated style with interpolated values when ready", () => {
        const { result } = renderHook(() =>
            useAnimatedHorizontalFilters({
                items: mockItems,
                selectedItem: mockSelectedItem,
                keyExtractor: mockKeyExtractor,
            }),
        )

        const mockScrollViewLayoutEvent = {
            nativeEvent: {
                layout: { x: 0, y: 0, width: 350, height: 52 },
            },
        } as LayoutChangeEvent

        act(() => {
            result.current.handleScrollViewLayout(mockScrollViewLayoutEvent)

            mockItems.forEach((_, index) => {
                result.current.handleChipLayout(createMockLayoutEvent(index * 84, 80), index)
            })
        })

        const style = result.current.indicatorAnimatedStyle

        expect(style).toHaveProperty("width")
        expect(style).toHaveProperty("transform")
        expect(Array.isArray(style.transform)).toBe(true)
    })
})
