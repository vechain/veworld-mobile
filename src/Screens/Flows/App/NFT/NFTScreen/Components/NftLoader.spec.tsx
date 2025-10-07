import React from "react"
import { render, screen } from "@testing-library/react-native"
import { NftLoader } from "./NftLoader"
import { TestWrapper } from "~Test"
import { Text } from "react-native"
import { withReanimatedTimer } from "react-native-reanimated"

const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => TestWrapper({ children, preloadedState: {} })
}

describe("NftLoader", () => {
    it("should display loader overlay when isLoading is true", () => {
        withReanimatedTimer(() => {
            render(
                <NftLoader isLoading={true}>
                    <Text>{"Test Content"}</Text>
                </NftLoader>,
                { wrapper: createWrapper() },
            )

            const overlay = screen.getByTestId("nft-loader-overlay")
            expect(overlay).toHaveAnimatedStyle({ opacity: 1 })
        })
    })

    it("should hide loader overlay when isLoading is false", () => {
        withReanimatedTimer(() => {
            const { rerender } = render(
                <NftLoader isLoading={true}>
                    <Text>{"Test Content"}</Text>
                </NftLoader>,
                { wrapper: createWrapper() },
            )

            const overlay = screen.getByTestId("nft-loader-overlay")
            expect(overlay).toHaveAnimatedStyle({ opacity: 1 })

            rerender(
                <NftLoader isLoading={false}>
                    <Text>{"Test Content"}</Text>
                </NftLoader>,
            )

            jest.advanceTimersByTime(300)
            expect(overlay).toHaveAnimatedStyle({ opacity: 0 })
        })
    })

    it("should set pointerEvents to 'auto' when isLoading is true", () => {
        withReanimatedTimer(() => {
            render(
                <NftLoader isLoading={true}>
                    <Text>{"Test Content"}</Text>
                </NftLoader>,
                { wrapper: createWrapper() },
            )

            const overlay = screen.getByTestId("nft-loader-overlay")
            expect(overlay).toHaveProp("pointerEvents", "auto")
        })
    })

    it("should set pointerEvents to 'none' when isLoading is false", () => {
        withReanimatedTimer(() => {
            render(
                <NftLoader isLoading={false}>
                    <Text>{"Test Content"}</Text>
                </NftLoader>,
                { wrapper: createWrapper() },
            )

            const overlay = screen.getByTestId("nft-loader-overlay")
            expect(overlay).toHaveProp("pointerEvents", "none")
        })
    })

    it("should render children content", () => {
        withReanimatedTimer(() => {
            render(
                <NftLoader isLoading={false}>
                    <Text testID="test-content">{"Test Content"}</Text>
                </NftLoader>,
                { wrapper: createWrapper() },
            )

            const content = screen.getByTestId("test-content")
            expect(content).toBeTruthy()
            expect(content).toHaveTextContent("Test Content")
        })
    })

    it("should handle loading state changes correctly", () => {
        withReanimatedTimer(() => {
            const { rerender } = render(
                <NftLoader isLoading={false}>
                    <Text>{"Test Content"}</Text>
                </NftLoader>,
                { wrapper: createWrapper() },
            )

            const overlay = screen.getByTestId("nft-loader-overlay")
            expect(overlay).toHaveAnimatedStyle({ opacity: 0 })
            expect(overlay).toHaveProp("pointerEvents", "none")

            // Change to loading
            rerender(
                <NftLoader isLoading={true}>
                    <Text>{"Test Content"}</Text>
                </NftLoader>,
            )

            jest.advanceTimersByTime(300)
            expect(overlay).toHaveAnimatedStyle({ opacity: 1 })
            expect(overlay).toHaveProp("pointerEvents", "auto")

            // Change back to not loading
            rerender(
                <NftLoader isLoading={false}>
                    <Text>{"Test Content"}</Text>
                </NftLoader>,
            )

            jest.advanceTimersByTime(300)
            expect(overlay).toHaveAnimatedStyle({ opacity: 0 })
            expect(overlay).toHaveProp("pointerEvents", "none")
        })
    })

    it("should render without children", () => {
        withReanimatedTimer(() => {
            render(<NftLoader isLoading={true} />, { wrapper: createWrapper() })

            const overlay = screen.getByTestId("nft-loader-overlay")
            expect(overlay).toBeTruthy()
            expect(overlay).toHaveAnimatedStyle({ opacity: 1 })
        })
    })

    it("should handle undefined isLoading prop", () => {
        withReanimatedTimer(() => {
            render(
                <NftLoader>
                    <Text>{"Test Content"}</Text>
                </NftLoader>,
                { wrapper: createWrapper() },
            )

            const overlay = screen.getByTestId("nft-loader-overlay")
            expect(overlay).toHaveAnimatedStyle({ opacity: 0 })
            expect(overlay).toHaveProp("pointerEvents", "none")
        })
    })
})
