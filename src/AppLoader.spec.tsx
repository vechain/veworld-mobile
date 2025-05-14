import React from "react"
import { render, screen } from "@testing-library/react-native"
import { AppLoader } from "./AppLoader"
import { TestWrapper } from "~Test"
import { RootState } from "~Storage/Redux/Types"
import { DerivationPath } from "~Constants"
import { Text } from "react-native"
import { withReanimatedTimer } from "react-native-reanimated"

const createWrapper = (preloadedState: Partial<RootState>) => {
    return ({ children }: { children: React.ReactNode }) => TestWrapper({ children, preloadedState })
}

describe("AppLoader", () => {
    it("should display loader overlay when isAppLoading is true", () => {
        withReanimatedTimer(() => {
            const preloadedState: Partial<RootState> = {
                cache: {
                    derivedPath: DerivationPath.VET,
                    isAppLoading: true,
                    isTokensOwnedLoading: false,
                    mnemonic: [],
                },
            }
            render(
                <AppLoader>
                    <Text>{"Test"}</Text>
                </AppLoader>,
                { wrapper: createWrapper(preloadedState) },
            )

            const overlay = screen.getByTestId("app-loader-overlay")
            expect(overlay).toHaveAnimatedStyle({ opacity: 1 })
        })
    })

    it("should hide loader overlay when isAppLoading is false", () => {
        withReanimatedTimer(() => {
            let currentState: Partial<RootState> = {
                cache: {
                    derivedPath: DerivationPath.VET,
                    isAppLoading: true,
                    isTokensOwnedLoading: false,
                    mnemonic: [],
                },
            }

            const dynamicWrapper = ({ children }: { children: React.ReactNode }) => {
                return TestWrapper({ children, preloadedState: currentState })
            }

            const { rerender } = render(
                <AppLoader>
                    <Text>{"Test"}</Text>
                </AppLoader>,
                { wrapper: dynamicWrapper },
            )

            const overlay = screen.getByTestId("app-loader-overlay")

            currentState = {
                cache: {
                    derivedPath: DerivationPath.VET,
                    isAppLoading: false,
                    isTokensOwnedLoading: false,
                    mnemonic: [],
                },
            }

            rerender(
                <AppLoader>
                    <Text>{"Test"}</Text>
                </AppLoader>,
            )

            jest.advanceTimersByTime(300)
            expect(overlay).toHaveAnimatedStyle({ opacity: 0 })
        })
    })

    it("should set display to 'flex' when opacity is not 0", () => {
        withReanimatedTimer(() => {
            const preloadedState: Partial<RootState> = {
                cache: {
                    derivedPath: DerivationPath.VET,
                    isAppLoading: true,
                    isTokensOwnedLoading: false,
                    mnemonic: [],
                },
            }

            render(
                <AppLoader>
                    <Text>{"Test"}</Text>
                </AppLoader>,
                { wrapper: createWrapper(preloadedState) },
            )

            const overlay = screen.getByTestId("app-loader-overlay")
            expect(overlay).toHaveAnimatedStyle({
                opacity: 1,
                display: "flex",
            })
        })
    })

    it("should set display style to 'none' when isAppLoading changes to false", () => {
        withReanimatedTimer(() => {
            let currentState: Partial<RootState> = {
                cache: {
                    derivedPath: DerivationPath.VET,
                    isAppLoading: true,
                    isTokensOwnedLoading: false,
                    mnemonic: [],
                },
            }

            const dynamicWrapper = ({ children }: { children: React.ReactNode }) => {
                return TestWrapper({ children, preloadedState: currentState })
            }

            const { rerender } = render(
                <AppLoader>
                    <Text>{"Test"}</Text>
                </AppLoader>,
                { wrapper: dynamicWrapper },
            )

            const overlay = screen.getByTestId("app-loader-overlay")
            expect(overlay).toHaveAnimatedStyle({
                opacity: 1,
                display: "flex",
            })

            currentState = {
                cache: {
                    derivedPath: DerivationPath.VET,
                    isAppLoading: false,
                    isTokensOwnedLoading: false,
                    mnemonic: [],
                },
            }

            rerender(
                <AppLoader>
                    <Text>{"Test"}</Text>
                </AppLoader>,
            )

            jest.advanceTimersByTime(300)

            expect(overlay).toHaveAnimatedStyle({
                opacity: 0,
                display: "none",
            })
        })
    })
})
