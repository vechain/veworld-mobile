import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs"
import { renderHook } from "@testing-library/react-hooks"
import React, { ReactNode } from "react"
import { PlatformUtils } from "~Utils"
import { useTabBarBottomMargin } from "./useTabBarBottomMargin"

const isAndroidSpy = jest.spyOn(PlatformUtils, "isAndroid")
const isIOSSpy = jest.spyOn(PlatformUtils, "isIOS")

const renderWithTabBarHeight = (height: number) =>
    renderHook(() => useTabBarBottomMargin(), {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <BottomTabBarHeightContext.Provider value={height}>{children}</BottomTabBarHeightContext.Provider>
        ),
    })

describe("useTabBarBottomMargin", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        isAndroidSpy.mockReset()
        isIOSSpy.mockReset()
    })

    it("returns default padding for Android when raw padding is zero or negative", () => {
        isAndroidSpy.mockReturnValue(true)
        isIOSSpy.mockReturnValue(false)

        const { result } = renderWithTabBarHeight(0)
        const { androidOnlyTabBarBottomMargin, iosOnlyTabBarBottomMargin, tabBarBottomMargin } = result.current

        expect(androidOnlyTabBarBottomMargin).toBe(24)
        expect(iosOnlyTabBarBottomMargin).toBe(0)
        expect(tabBarBottomMargin).toBe(0)
    })

    it("adds additional padding on Android when raw padding is greater than zero", () => {
        isAndroidSpy.mockReturnValue(true)
        isIOSSpy.mockReturnValue(false)

        const { result } = renderWithTabBarHeight(10)
        const { androidOnlyTabBarBottomMargin, iosOnlyTabBarBottomMargin, tabBarBottomMargin } = result.current

        expect(androidOnlyTabBarBottomMargin).toBe(10)
        expect(iosOnlyTabBarBottomMargin).toBe(0)
        expect(tabBarBottomMargin).toBe(10)
    })

    it("returns raw padding for iOS and zero for Android-only selector when running on iOS", () => {
        isAndroidSpy.mockReturnValue(false)
        isIOSSpy.mockReturnValue(true)

        const { result } = renderWithTabBarHeight(20)
        const { androidOnlyTabBarBottomMargin, iosOnlyTabBarBottomMargin, tabBarBottomMargin } = result.current

        expect(androidOnlyTabBarBottomMargin).toBe(0)
        expect(iosOnlyTabBarBottomMargin).toBe(20)
        expect(tabBarBottomMargin).toBe(20)
    })

    it("returns raw padding on tabBarBottomMargin even when platform is not Android or iOS", () => {
        isAndroidSpy.mockReturnValue(false)
        isIOSSpy.mockReturnValue(false)

        const { result } = renderWithTabBarHeight(15)
        const { androidOnlyTabBarBottomMargin, iosOnlyTabBarBottomMargin, tabBarBottomMargin } = result.current

        expect(androidOnlyTabBarBottomMargin).toBe(0)
        expect(iosOnlyTabBarBottomMargin).toBe(0)
        expect(tabBarBottomMargin).toBe(15)
    })

    it("falls back to zero outside a tab navigator", () => {
        isAndroidSpy.mockReturnValue(false)
        isIOSSpy.mockReturnValue(true)

        const { result } = renderHook(() => useTabBarBottomMargin())

        expect(result.current.tabBarBottomMargin).toBe(0)
        expect(result.current.iosOnlyTabBarBottomMargin).toBe(0)
    })
})
