import { renderHook } from "@testing-library/react-hooks"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useTabBarBottomMargin } from "./useTabBarBottomMargin"
import { PlatformUtils } from "~Utils"

const mockedUseBottomTabBarHeight = useBottomTabBarHeight as jest.MockedFunction<typeof useBottomTabBarHeight>
const isAndroidSpy = jest.spyOn(PlatformUtils, "isAndroid")
const isIOSSpy = jest.spyOn(PlatformUtils, "isIOS")

describe("useTabBarBottomMargin", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        isAndroidSpy.mockReset()
        isIOSSpy.mockReset()
    })

    it("returns default padding for Android when raw padding is zero or negative", () => {
        isAndroidSpy.mockReturnValue(true)
        isIOSSpy.mockReturnValue(false)
        mockedUseBottomTabBarHeight.mockReturnValue(0)

        const { result } = renderHook(() => useTabBarBottomMargin())
        const { androidOnlyTabBarBottomMargin, iosOnlyTabBarBottomMargin, tabBarBottomMargin } = result.current

        expect(androidOnlyTabBarBottomMargin).toBe(24)
        expect(iosOnlyTabBarBottomMargin).toBe(0)
        expect(tabBarBottomMargin).toBe(0)
    })

    it("adds additional padding on Android when raw padding is greater than zero", () => {
        isAndroidSpy.mockReturnValue(true)
        isIOSSpy.mockReturnValue(false)
        mockedUseBottomTabBarHeight.mockReturnValue(10)

        const { result } = renderHook(() => useTabBarBottomMargin())
        const { androidOnlyTabBarBottomMargin, iosOnlyTabBarBottomMargin, tabBarBottomMargin } = result.current

        expect(androidOnlyTabBarBottomMargin).toBe(10)
        expect(iosOnlyTabBarBottomMargin).toBe(0)
        expect(tabBarBottomMargin).toBe(10)
    })
    it("returns raw padding for iOS and zero for Android-only selector when running on iOS", () => {
        isAndroidSpy.mockReturnValue(false)
        isIOSSpy.mockReturnValue(true)
        mockedUseBottomTabBarHeight.mockReturnValue(20)

        const { result } = renderHook(() => useTabBarBottomMargin())
        const { androidOnlyTabBarBottomMargin, iosOnlyTabBarBottomMargin, tabBarBottomMargin } = result.current

        expect(androidOnlyTabBarBottomMargin).toBe(0)
        expect(iosOnlyTabBarBottomMargin).toBe(20)
        expect(tabBarBottomMargin).toBe(20)
    })

    it("returns raw padding on tabBarBottomMargin even when platform is not Android or iOS", () => {
        isAndroidSpy.mockReturnValue(false)
        isIOSSpy.mockReturnValue(false)
        mockedUseBottomTabBarHeight.mockReturnValue(15)

        const { result } = renderHook(() => useTabBarBottomMargin())
        const { androidOnlyTabBarBottomMargin, iosOnlyTabBarBottomMargin, tabBarBottomMargin } = result.current

        expect(androidOnlyTabBarBottomMargin).toBe(0)
        expect(iosOnlyTabBarBottomMargin).toBe(0)
        expect(tabBarBottomMargin).toBe(15)
    })
})
