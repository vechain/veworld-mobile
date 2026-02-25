import { render } from "@testing-library/react-native"
import React from "react"
import { useTabBarBottomMargin } from "~Hooks"
import { setPlatform, TestWrapper } from "~Test"
import { TabRenderer } from "./TabRenderer"

jest.mock("~Hooks/useTabBarBottomMargin", () => ({
    useTabBarBottomMargin: jest.fn(),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigationState: jest.fn(),
}))

const mockedUseTabBarBottomMargin = useTabBarBottomMargin as jest.MockedFunction<typeof useTabBarBottomMargin>

describe("BalanceScreen -> TabRenderer", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("uses androidOnlyTabBarBottomMargin on Android", () => {
        setPlatform("android")
        mockedUseTabBarBottomMargin.mockReturnValue({
            iosOnlyTabBarBottomMargin: 5,
            androidOnlyTabBarBottomMargin: 42,
            tabBarBottomMargin: 0,
        })

        const onLayout = jest.fn()
        const AnimatedView = require("react-native-reanimated").default.View

        const { UNSAFE_getAllByType } = render(<TabRenderer onLayout={onLayout} />, {
            wrapper: ({ children }) => <TestWrapper preloadedState={{}}>{children}</TestWrapper>,
        })

        const [root] = UNSAFE_getAllByType(AnimatedView)

        expect(root.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ paddingBottom: 42 + 72 })]))
    })

    it("uses iosOnlyTabBarBottomMargin when not Android", () => {
        setPlatform("ios")
        mockedUseTabBarBottomMargin.mockReturnValue({
            iosOnlyTabBarBottomMargin: 10,
            androidOnlyTabBarBottomMargin: 0,
            tabBarBottomMargin: 0,
        })

        const onLayout = jest.fn()
        const AnimatedView = require("react-native-reanimated").default.View

        const { UNSAFE_getAllByType } = render(<TabRenderer onLayout={onLayout} />, {
            wrapper: ({ children }) => <TestWrapper preloadedState={{}}>{children}</TestWrapper>,
        })

        const [root] = UNSAFE_getAllByType(AnimatedView)

        expect(root.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ paddingBottom: 10 })]))
    })
})
