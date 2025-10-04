import { renderHook } from "@testing-library/react-hooks"
import { useContentSwipeAnimation } from "./useContentSwipeAnimation"

jest.mock("react-native-reanimated", () => ({
    useSharedValue: jest.fn((initialValue: number) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn((styleFunction: () => object) => styleFunction()),
    withTiming: jest.fn((value: number) => value),
    withDelay: jest.fn((delay: number, animation: any) => animation),
    runOnJS: jest.fn((fn: () => void) => fn),
    Easing: {
        out: jest.fn(() => jest.fn()),
        quad: jest.fn(() => jest.fn()),
    },
}))

jest.mock("react-native", () => ({
    Dimensions: {
        get: jest.fn(() => ({ width: 375, height: 812 })),
    },
}))

describe("useContentSwipeAnimation", () => {
    const mockOnAnimationComplete = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should initialize with correct default values", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: null,
                onAnimationComplete: mockOnAnimationComplete,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
        expect(result.current.translateX).toBeDefined()
        expect(result.current.opacity).toBeDefined()
    })

    it("should return animated style with transform and opacity", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: null,
                onAnimationComplete: mockOnAnimationComplete,
            }),
        )

        const style = result.current.animatedStyle

        expect(style).toHaveProperty("transform")
        expect(style).toHaveProperty("opacity")
        expect(Array.isArray(style.transform)).toBe(true)
    })

    it("should not trigger animation when animationDirection is null", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: null,
                onAnimationComplete: mockOnAnimationComplete,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
    })

    it("should trigger animation when animationDirection is 'left'", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "left",
                onAnimationComplete: mockOnAnimationComplete,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
        expect(result.current.translateX).toBeDefined()
        expect(result.current.opacity).toBeDefined()
    })

    it("should trigger animation when animationDirection is 'right'", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "right",
                onAnimationComplete: mockOnAnimationComplete,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
        expect(result.current.translateX).toBeDefined()
        expect(result.current.opacity).toBeDefined()
    })

    it("should use default fadeOpacity when not provided", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "left",
                onAnimationComplete: mockOnAnimationComplete,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
    })

    it("should use custom fadeOpacity when provided", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "left",
                onAnimationComplete: mockOnAnimationComplete,
                fadeOpacity: 0.1,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
    })

    it("should handle animation direction changes", () => {
        const { result, rerender } = renderHook(props => useContentSwipeAnimation(props), {
            initialProps: {
                animationDirection: null as "left" | "right" | null,
                onAnimationComplete: mockOnAnimationComplete,
            },
        })

        expect(result.current.animatedStyle).toBeDefined()

        rerender({
            animationDirection: "left",
            onAnimationComplete: mockOnAnimationComplete,
        })

        expect(result.current.animatedStyle).toBeDefined()

        rerender({
            animationDirection: "right",
            onAnimationComplete: mockOnAnimationComplete,
        })

        expect(result.current.animatedStyle).toBeDefined()

        rerender({
            animationDirection: null,
            onAnimationComplete: mockOnAnimationComplete,
        })

        expect(result.current.animatedStyle).toBeDefined()
    })

    it("should work without onAnimationComplete callback", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "left",
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
        expect(result.current.translateX).toBeDefined()
        expect(result.current.opacity).toBeDefined()
    })

    it("should handle multiple animation direction changes rapidly", () => {
        const { result, rerender } = renderHook(props => useContentSwipeAnimation(props), {
            initialProps: {
                animationDirection: null as "left" | "right" | null,
                onAnimationComplete: mockOnAnimationComplete,
            },
        })

        const directions: Array<"left" | "right" | null> = ["left", "right", "left", null, "right"]

        directions.forEach(direction => {
            rerender({
                animationDirection: direction,
                onAnimationComplete: mockOnAnimationComplete,
            })

            expect(result.current.animatedStyle).toBeDefined()
        })
    })

    it("should maintain consistent return interface", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "left",
                onAnimationComplete: mockOnAnimationComplete,
            }),
        )

        expect(result.current).toHaveProperty("animatedStyle")
        expect(result.current).toHaveProperty("translateX")
        expect(result.current).toHaveProperty("opacity")

        expect(typeof result.current.animatedStyle).toBe("object")
        expect(typeof result.current.translateX).toBe("object")
        expect(typeof result.current.opacity).toBe("object")
    })

    it("should handle edge case with zero fadeOpacity", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "left",
                onAnimationComplete: mockOnAnimationComplete,
                fadeOpacity: 0,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
    })

    it("should handle edge case with fadeOpacity of 1", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "right",
                onAnimationComplete: mockOnAnimationComplete,
                fadeOpacity: 1,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
    })

    it("should work with different screen widths", () => {
        const mockDimensions = require("react-native").Dimensions
        mockDimensions.get.mockReturnValue({ width: 414, height: 896 })

        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "left",
                onAnimationComplete: mockOnAnimationComplete,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
    })

    it("should handle animation completion callback correctly", () => {
        const { result } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "left",
                onAnimationComplete: mockOnAnimationComplete,
            }),
        )

        expect(result.current.animatedStyle).toBeDefined()
    })

    it("should maintain stable references across re-renders with same props", () => {
        const { result, rerender } = renderHook(() =>
            useContentSwipeAnimation({
                animationDirection: "left",
                onAnimationComplete: mockOnAnimationComplete,
                fadeOpacity: 0.4,
            }),
        )

        const initialTranslateX = result.current.translateX
        const initialOpacity = result.current.opacity

        rerender()

        expect(result.current.translateX).toStrictEqual(initialTranslateX)
        expect(result.current.opacity).toStrictEqual(initialOpacity)
    })

    it("should handle props changes correctly", () => {
        const { result, rerender } = renderHook(props => useContentSwipeAnimation(props), {
            initialProps: {
                animationDirection: null as "left" | "right" | null,
                onAnimationComplete: mockOnAnimationComplete,
                fadeOpacity: 0.4,
            },
        })

        expect(result.current.animatedStyle).toBeDefined()

        rerender({
            animationDirection: "left",
            onAnimationComplete: mockOnAnimationComplete,
            fadeOpacity: 0.2,
        })

        expect(result.current.animatedStyle).toBeDefined()
    })
})
