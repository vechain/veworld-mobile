import React from "react"
import { render, fireEvent, waitFor } from "@testing-library/react-native"
import { NotificationScreen } from "./NotificationScreen"
import { TestWrapper } from "~Test"
import { NOTIFICATION_CATEGORIES } from "~Constants"

const mockUpdateNotificationCenterPrefs = jest.fn()

const createMockUseNotifications = (overrides = {}) => ({
    isNotificationPermissionEnabled: true,
    isUserOptedIn: true,
    featureEnabled: true,
    optIn: jest.fn(),
    optOut: jest.fn(),
    requestNotficationPermission: jest.fn(),
    getTags: jest.fn().mockResolvedValue({}),
    addTag: jest.fn(),
    removeTag: jest.fn(),
    addAllDAppsTags: jest.fn(),
    removeAllDAppsTags: jest.fn(),
    disabledCategories: [],
    updateNotificationCenterPrefs: mockUpdateNotificationCenterPrefs,
    ...overrides,
})

let mockValues = createMockUseNotifications()

jest.mock("~Components/Providers/NotificationsProvider", () => {
    const actual = jest.requireActual("~Components/Providers/NotificationsProvider")
    return {
        ...actual,
        useNotifications: () => mockValues,
    }
})

jest.mock("~Hooks/useFetchFeaturedDApps", () => ({
    useVeBetterDaoDapps: () => ({ data: [], error: null }),
}))

describe("NotificationScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUpdateNotificationCenterPrefs.mockResolvedValue(undefined)
        mockValues = createMockUseNotifications()
    })

    describe("Disabled alert", () => {
        it("should display disabled alert when notification permission is not enabled", async () => {
            mockValues = createMockUseNotifications({
                isNotificationPermissionEnabled: false,
                isUserOptedIn: false,
            })

            const { getByText } = render(
                <TestWrapper preloadedState={{}}>
                    <NotificationScreen />
                </TestWrapper>,
            )

            await waitFor(() => {
                expect(getByText("Device settings")).toBeTruthy()
            })
        })

        it("should not display disabled alert when notification permission is enabled", async () => {
            mockValues = createMockUseNotifications({
                isNotificationPermissionEnabled: true,
                isUserOptedIn: true,
            })

            const { queryByText } = render(
                <TestWrapper preloadedState={{}}>
                    <NotificationScreen />
                </TestWrapper>,
            )

            await waitFor(() => {
                expect(queryByText("Device settings")).toBeNull()
            })
        })
    })

    describe("Notification preferences", () => {
        it("should call updateNotificationCenterPrefs when NFT updates toggle is pressed", async () => {
            mockValues = createMockUseNotifications({
                isNotificationPermissionEnabled: true,
                isUserOptedIn: true,
            })

            const { getByText } = render(
                <TestWrapper preloadedState={{}}>
                    <NotificationScreen />
                </TestWrapper>,
            )

            await waitFor(() => {
                expect(getByText("NFT updates")).toBeTruthy()
            })

            const nftUpdatesText = getByText("NFT updates")
            const enableFeatureContainer = nftUpdatesText.parent?.parent?.parent

            if (enableFeatureContainer) {
                fireEvent(enableFeatureContainer, "onValueChange", false)
            }

            await waitFor(() => {
                expect(mockUpdateNotificationCenterPrefs).toHaveBeenCalledWith(
                    NOTIFICATION_CATEGORIES.NFT_UPDATES,
                    false,
                )
            })
        })

        it("should call updateNotificationCenterPrefs when Rewards toggle is pressed", async () => {
            mockValues = createMockUseNotifications({
                isNotificationPermissionEnabled: true,
                isUserOptedIn: true,
            })

            const { getByText } = render(
                <TestWrapper preloadedState={{}}>
                    <NotificationScreen />
                </TestWrapper>,
            )

            await waitFor(() => {
                expect(getByText("Rewards updates")).toBeTruthy()
            })

            const rewardsText = getByText("Rewards updates")
            const enableFeatureContainer = rewardsText.parent?.parent?.parent

            if (enableFeatureContainer) {
                fireEvent(enableFeatureContainer, "onValueChange", false)
            }

            await waitFor(() => {
                expect(mockUpdateNotificationCenterPrefs).toHaveBeenCalledWith(NOTIFICATION_CATEGORIES.REWARDS, false)
            })
        })
    })
})
