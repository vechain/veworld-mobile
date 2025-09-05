import { COLORS } from "~Constants"

import { getActionTextColor } from "./BrowserBottomSheet"

describe("BrowserBottomSheet Utils", () => {
    describe("getActionTextColor", () => {
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
