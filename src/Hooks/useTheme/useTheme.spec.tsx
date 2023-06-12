import React from "react"
import { renderHook } from "@testing-library/react-hooks/native"
import { useTheme, useThemedStyles } from "./useTheme"
import { ColorTheme, ColorThemeType } from "../../Constants/Theme/Theme"
import { TestWrapper } from "~Test"
import { ThemeEnum } from "~Constants"

describe("useTheme", () => {
    it("should return the correct system theme", async () => {
        const preloadedState = {
            userPreferences: { theme: ThemeEnum.SYSTEM } as any,
        }
        const { result, waitForNextUpdate } = renderHook(() => useTheme(), {
            wrapper: (({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>
                    {children}
                </TestWrapper>
            )) as any,
        })
        await waitForNextUpdate({ timeout: 5000 })
        expect(result.current).toEqual(ColorTheme("light"))
    })
    it("should return the correct dark theme", async () => {
        const preloadedState = {
            userPreferences: { theme: ThemeEnum.DARK } as any,
        }
        const { result, waitForNextUpdate } = renderHook(() => useTheme(), {
            wrapper: (({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>
                    {children}
                </TestWrapper>
            )) as any,
        })
        await waitForNextUpdate({ timeout: 5000 })
        expect(result.current).toEqual(ColorTheme("dark"))
    })
    it("should return the correct light theme", async () => {
        const preloadedState = {
            userPreferences: { theme: ThemeEnum.LIGHT } as any,
        }
        const { result, waitForNextUpdate } = renderHook(() => useTheme(), {
            wrapper: (({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>
                    {children}
                </TestWrapper>
            )) as any,
        })
        await waitForNextUpdate({ timeout: 5000 })
        expect(result.current).toEqual(ColorTheme("light"))
    })
    it("should return the correct light theme if theme is null", async () => {
        const preloadedState = {
            userPreferences: { theme: null } as any,
        }
        const { result, waitForNextUpdate } = renderHook(() => useTheme(), {
            wrapper: (({ children }: { children: React.ReactNode }) => (
                <TestWrapper preloadedState={preloadedState}>
                    {children}
                </TestWrapper>
            )) as any,
        })
        await waitForNextUpdate({ timeout: 5000 })
        expect(result.current).toEqual(ColorTheme("light"))
    })
})

describe("useThemedStyles", () => {
    it("should return the correct styles and theme", async () => {
        const mockStyles = (theme: ColorThemeType) => ({
            container: {
                backgroundColor: theme.colors.background,
            },
        })

        const { result, waitForNextUpdate } = renderHook(
            () => useThemedStyles(mockStyles),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({ timeout: 5000 })

        expect(result.current.styles).toEqual({
            container: {
                backgroundColor: result.current.theme.colors.background,
            },
        })
    })
})
