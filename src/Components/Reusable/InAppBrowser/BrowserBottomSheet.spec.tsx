import React from "react"
import { COLORS } from "~Constants"

jest.mock("@react-navigation/stack", () => ({
    createStackNavigator: jest.fn(() => ({
        Navigator: ({ children }: { children: React.ReactNode }) => children,
        Screen: ({ children }: { children: React.ReactNode }) => children,
        Group: ({ children }: { children: React.ReactNode }) => children,
    })),
}))

jest.mock("@react-navigation/native-stack", () => ({
    createNativeStackNavigator: jest.fn(() => ({
        Navigator: ({ children }: { children: React.ReactNode }) => children,
        Screen: ({ children }: { children: React.ReactNode }) => children,
    })),
}))

jest.mock("@react-navigation/material-top-tabs", () => ({
    createMaterialTopTabNavigator: jest.fn(() => ({
        Navigator: ({ children }: { children: React.ReactNode }) => children,
        Screen: ({ children }: { children: React.ReactNode }) => children,
    })),
}))

jest.mock("@react-navigation/bottom-tabs", () => ({
    createBottomTabNavigator: jest.fn(() => ({
        Navigator: ({ children }: { children: React.ReactNode }) => children,
        Screen: ({ children }: { children: React.ReactNode }) => children,
    })),
    useBottomTabBarHeight: jest.fn(() => 10),
}))

jest.mock("react-native-view-shot", () => ({
    captureRef: jest.fn(),
    releaseCapture: jest.fn(),
}))

jest.mock("~Components/Providers/InAppBrowserProvider", () => ({
    useInAppBrowser: () => ({
        isDapp: true,
        navigationState: { url: "https://example.com", canGoBack: true },
        webviewRef: { current: { reload: jest.fn(), goBack: jest.fn() } },
        dappMetadata: { name: "Test", description: "Test", url: "https://example.com" },
    }),
}))

jest.mock("~Components/Providers/FeatureFlagsProvider", () => ({
    useFeatureFlags: () => ({
        betterWorldFeature: { appsScreen: { enabled: true } },
    }),
}))

jest.mock("~Hooks/useDappBookmarking", () => ({
    useDappBookmarking: () => ({
        isBookMarked: false,
        toggleBookmark: jest.fn(),
    }),
}))

jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({ replace: jest.fn() }),
}))

jest.mock("~Storage/Redux", () => ({
    useAppDispatch: () => jest.fn(),
    useAppSelector: () => "test-tab-id",
    closeTab: jest.fn(),
    selectCurrentTabId: jest.fn(),
}))

// Import the component after all mocks are set up
import { BrowserBottomSheet, getActionTextColorForTesting } from "./BrowserBottomSheet"

describe("BrowserBottomSheet", () => {
    it("should be defined and exportable", () => {
        expect(BrowserBottomSheet).toBeDefined()
        expect(typeof BrowserBottomSheet).toBe("object")
    })

    it("should be a React component", () => {
        const component = React.createElement(BrowserBottomSheet, { ref: { current: null } })
        expect(component).toBeDefined()
        expect(component.type).toBe(BrowserBottomSheet)
    })

    describe("getActionTextColor logic (exported test function)", () => {
        const mockTheme = {
            colors: {
                actionBottomSheet: {
                    disabledText: COLORS.GREY_400,
                    dangerText: COLORS.RED_500,
                    text: COLORS.GREY_700,
                },
            },
        }

        it("should return disabled text color when action is disabled", () => {
            const action = { id: "reload", disabled: true }
            const result = getActionTextColorForTesting(action, mockTheme)
            expect(result).toBe(COLORS.GREY_400)
        })

        it("should return danger text color for close-tab action when not disabled", () => {
            const action = { id: "close-tab", disabled: false }
            const result = getActionTextColorForTesting(action, mockTheme)
            expect(result).toBe(COLORS.RED_500)
        })

        it("should return disabled text color for close-tab action when disabled (disabled takes priority)", () => {
            const action = { id: "close-tab", disabled: true }
            const result = getActionTextColorForTesting(action, mockTheme)
            expect(result).toBe(COLORS.GREY_400)
        })

        it("should return regular text color for normal actions", () => {
            const action = { id: "reload", disabled: false }
            const result = getActionTextColorForTesting(action, mockTheme)
            expect(result).toBe(COLORS.GREY_700)
        })

        it("should return regular text color when disabled is undefined", () => {
            const action = { id: "reload" }
            const result = getActionTextColorForTesting(action, mockTheme)
            expect(result).toBe(COLORS.GREY_700)
        })

        it("should handle various action IDs correctly", () => {
            const actions = [
                { id: "share", disabled: false },
                { id: "new-tab", disabled: false },
                { id: "go-back", disabled: false },
            ]

            actions.forEach(action => {
                const result = getActionTextColorForTesting(action, mockTheme)
                expect(result).toBe(COLORS.GREY_700)
            })
        })
    })
})
