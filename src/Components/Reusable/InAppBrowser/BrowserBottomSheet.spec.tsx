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
import { BrowserBottomSheet, getActionTextColor } from "./BrowserBottomSheet"

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

    describe("getActionTextColor logic", () => {
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
            const action = {
                type: "action" as const,
                id: "reload",
                icon: "icon-retry" as const,
                label: "Reload",
                onPress: jest.fn(),
                disabled: true,
            }
            const result = getActionTextColor(action, mockTheme)
            expect(result).toBe(COLORS.GREY_400)
        })

        it("should return danger text color for close-tab action when not disabled", () => {
            const action = {
                type: "action" as const,
                id: "close-tab",
                icon: "icon-x" as const,
                label: "Close",
                onPress: jest.fn(),
                disabled: false,
            }
            const result = getActionTextColor(action, mockTheme)
            expect(result).toBe(COLORS.RED_500)
        })

        it("should return disabled text color for close-tab action when disabled (disabled takes priority)", () => {
            const action = {
                type: "action" as const,
                id: "close-tab",
                icon: "icon-x" as const,
                label: "Close",
                onPress: jest.fn(),
                disabled: true,
            }
            const result = getActionTextColor(action, mockTheme)
            expect(result).toBe(COLORS.GREY_400)
        })

        it("should return regular text color for normal actions", () => {
            const action = {
                type: "action" as const,
                id: "reload",
                icon: "icon-retry" as const,
                label: "Reload",
                onPress: jest.fn(),
                disabled: false,
            }
            const result = getActionTextColor(action, mockTheme)
            expect(result).toBe(COLORS.GREY_700)
        })

        it("should return regular text color when disabled is undefined", () => {
            const action = {
                type: "action" as const,
                id: "reload",
                icon: "icon-retry" as const,
                label: "Reload",
                onPress: jest.fn(),
            }
            const result = getActionTextColor(action, mockTheme)
            expect(result).toBe(COLORS.GREY_700)
        })

        it("should handle various action IDs correctly", () => {
            const actions = [
                {
                    type: "action" as const,
                    id: "share",
                    icon: "icon-share-2" as const,
                    label: "Share",
                    onPress: jest.fn(),
                    disabled: false,
                },
                {
                    type: "action" as const,
                    id: "new-tab",
                    icon: "icon-plus" as const,
                    label: "New Tab",
                    onPress: jest.fn(),
                    disabled: false,
                },
                {
                    type: "action" as const,
                    id: "go-back",
                    icon: "icon-chevron-left" as const,
                    label: "Go Back",
                    onPress: jest.fn(),
                    disabled: false,
                },
            ]

            actions.forEach(action => {
                const result = getActionTextColor(action, mockTheme)
                expect(result).toBe(COLORS.GREY_700)
            })
        })
    })
})
