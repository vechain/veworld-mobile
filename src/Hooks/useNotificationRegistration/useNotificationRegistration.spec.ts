import { renderHook } from "@testing-library/react-hooks"
import { waitFor } from "@testing-library/react-native"
import { OneSignal } from "react-native-onesignal"
import { useNotificationRegistration } from "./useNotificationRegistration"
import { DEVICE_TYPE } from "~Model"
import * as Redux from "~Storage/Redux"
import * as NotificationCenterAPI from "~Networking/NotificationCenter/NotificationCenterAPI"

const mockDispatch = jest.fn()
const mockUseAppSelector = jest.fn()

// Mock dependencies
jest.mock("react-native-onesignal")
jest.mock("~Networking/NotificationCenter/NotificationCenterAPI")
jest.mock("~Storage/Redux", () => {
    const originalModule = jest.requireActual("~Storage/Redux")
    return {
        ...originalModule,
        useAppDispatch: () => mockDispatch,
        useAppSelector: (selector: any) => mockUseAppSelector(selector),
    }
})

describe("useNotificationRegistration", () => {
    const mockSubscriptionId = "test-subscription-id"
    const mockAddress1 = "0x1234567890123456789012345678901234567890"
    const mockAddress2 = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
    const mockAddress3 = "0x9999999999999999999999999999999999999999"
    const mockBaseUrl = "https://test-notification-center.com"

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock OneSignal
        ;(OneSignal.User.pushSubscription.getIdAsync as jest.Mock) = jest.fn().mockResolvedValue(mockSubscriptionId)

        // Mock API calls with successful responses
        ;(NotificationCenterAPI.registerPushNotification as jest.Mock).mockResolvedValue({ failed: [] })
        ;(NotificationCenterAPI.unregisterPushNotification as jest.Mock).mockResolvedValue({ failed: [] })

        // Mock environment variables
        process.env.NOTIFICATION_CENTER_REGISTER_DEV = mockBaseUrl
        process.env.NOTIFICATION_CENTER_REGISTER_PROD = mockBaseUrl
    })

    const setupMockSelector = (accounts: any[], registrations: any[], customUrl?: string) => {
        mockUseAppSelector.mockImplementation((selector: any) => {
            if (selector === Redux.selectAccounts) {
                return accounts
            }
            // For the selectNotificationCenterUrl call
            const selectorString = selector.toString()
            if (selectorString.includes("notificationCenterUrl") || selector.name === "memoized") {
                return customUrl
            }
            // For the registrationSelectors.selectAll call
            if (typeof selector === "function") {
                return registrations
            }
            return []
        })
    }

    describe("registration behavior", () => {
        it("should register new addresses when they are added", async () => {
            const accounts = [{ address: mockAddress1, index: 0 }]
            setupMockSelector(accounts, [])

            renderHook(() => useNotificationRegistration({ enabled: true }))

            await waitFor(() =>
                expect(NotificationCenterAPI.registerPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress1],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                }),
            )
            expect(NotificationCenterAPI.unregisterPushNotification).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("upsertRegistrations"),
                    payload: expect.arrayContaining([
                        expect.objectContaining({
                            address: mockAddress1,
                            lastSuccessfulSync: expect.any(Number),
                            registeredUrl: mockBaseUrl,
                        }),
                    ]),
                }),
            )
        })

        it("should not register observed accounts", async () => {
            const accounts = [
                { address: mockAddress1, index: 0 },
                { address: mockAddress2, index: 1, type: DEVICE_TYPE.LOCAL_WATCHED },
            ]
            setupMockSelector(accounts, [])

            renderHook(() => useNotificationRegistration({ enabled: true }))

            await waitFor(() => {
                expect(NotificationCenterAPI.registerPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress1],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                })
            })
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("upsertRegistrations"),
                    payload: expect.arrayContaining([
                        expect.objectContaining({
                            address: mockAddress1,
                            lastSuccessfulSync: expect.any(Number),
                            registeredUrl: mockBaseUrl,
                        }),
                    ]),
                }),
            )
        })

        it("should unregister addresses that have been removed", async () => {
            const accounts = [{ address: mockAddress1, index: 0 }]
            const registrations = [
                { address: mockAddress1, lastSuccessfulSync: Date.now() },
                { address: mockAddress2, lastSuccessfulSync: Date.now() },
            ]
            setupMockSelector(accounts, registrations)

            renderHook(() => useNotificationRegistration({ enabled: true }))

            await waitFor(() => {
                expect(NotificationCenterAPI.unregisterPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress2],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                })
            })
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("removeRegistrations"),
                    payload: expect.arrayContaining([mockAddress2]),
                }),
            )
        })

        it("should re-register addresses that are due (30 days old)", async () => {
            const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000
            const accounts = [{ address: mockAddress1, index: 0 }]
            const registrations = [{ address: mockAddress1, lastSuccessfulSync: thirtyOneDaysAgo }]
            setupMockSelector(accounts, registrations)

            renderHook(() => useNotificationRegistration({ enabled: true }))

            await waitFor(() => {
                expect(NotificationCenterAPI.registerPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress1],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                })
            })
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("upsertRegistrations"),
                    payload: expect.arrayContaining([
                        expect.objectContaining({
                            address: mockAddress1,
                            lastSuccessfulSync: expect.any(Number),
                            registeredUrl: mockBaseUrl,
                        }),
                    ]),
                }),
            )
        })

        it("should not re-register addresses that are not due (less than 30 days old)", async () => {
            const recentSync = Date.now() - 15 * 24 * 60 * 60 * 1000
            const accounts = [{ address: mockAddress1, index: 0 }]
            const registrations = [
                { address: mockAddress1, lastSuccessfulSync: recentSync, registeredUrl: mockBaseUrl },
            ]
            setupMockSelector(accounts, registrations)

            renderHook(() => useNotificationRegistration({ enabled: true }))

            // Wait for useEffect to complete before asserting negative
            await new Promise(resolve => setTimeout(resolve, 100))

            expect(NotificationCenterAPI.registerPushNotification).not.toHaveBeenCalled()
            expect(NotificationCenterAPI.unregisterPushNotification).not.toHaveBeenCalled()
        })

        it("should handle both registrations and unregistrations simultaneously", async () => {
            const accounts = [{ address: mockAddress2, index: 0 }]
            const registrations = [{ address: mockAddress1, lastSuccessfulSync: Date.now() }]
            setupMockSelector(accounts, registrations)

            renderHook(() => useNotificationRegistration({ enabled: true }))

            await waitFor(() => {
                expect(NotificationCenterAPI.registerPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress2],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                })
                expect(NotificationCenterAPI.unregisterPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress1],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                })
            })
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("upsertRegistrations"),
                    payload: expect.arrayContaining([
                        expect.objectContaining({
                            address: mockAddress2,
                            lastSuccessfulSync: expect.any(Number),
                            registeredUrl: mockBaseUrl,
                        }),
                    ]),
                }),
            )
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("removeRegistrations"),
                    payload: expect.arrayContaining([mockAddress1]),
                }),
            )
        })

        it("should handle multiple addresses requiring different actions", async () => {
            const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000
            const recentSync = Date.now() - 5 * 24 * 60 * 60 * 1000

            const accounts = [
                { address: mockAddress1, index: 0 },
                { address: mockAddress2, index: 1 },
            ]
            const registrations = [
                { address: mockAddress1, lastSuccessfulSync: thirtyOneDaysAgo, registeredUrl: mockBaseUrl },
                { address: mockAddress2, lastSuccessfulSync: recentSync, registeredUrl: mockBaseUrl },
                { address: mockAddress3, lastSuccessfulSync: Date.now(), registeredUrl: mockBaseUrl },
            ]
            setupMockSelector(accounts, registrations)

            renderHook(() => useNotificationRegistration({ enabled: true }))

            await waitFor(() => {
                expect(NotificationCenterAPI.registerPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress1],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                })
                expect(NotificationCenterAPI.unregisterPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress3],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                })
            })
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("upsertRegistrations"),
                    payload: expect.arrayContaining([
                        expect.objectContaining({
                            address: mockAddress1,
                            lastSuccessfulSync: expect.any(Number),
                            registeredUrl: mockBaseUrl,
                        }),
                    ]),
                }),
            )
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("removeRegistrations"),
                    payload: expect.arrayContaining([mockAddress3]),
                }),
            )
        })

        it("should re-register addresses when URL has changed", async () => {
            const oldUrl = "https://old-notification-center.com"
            const accounts = [{ address: mockAddress1, index: 0 }]
            const registrations = [
                {
                    address: mockAddress1,
                    lastSuccessfulSync: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
                    registeredUrl: oldUrl,
                },
            ]
            setupMockSelector(accounts, registrations) // Uses mockBaseUrl which is different from oldUrl

            renderHook(() => useNotificationRegistration({ enabled: true }))

            await waitFor(() => {
                expect(NotificationCenterAPI.registerPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress1],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                })
            })
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("upsertRegistrations"),
                    payload: expect.arrayContaining([
                        expect.objectContaining({
                            address: mockAddress1,
                            lastSuccessfulSync: expect.any(Number),
                            registeredUrl: mockBaseUrl,
                        }),
                    ]),
                }),
            )
        })
    })

    describe("enabled flag", () => {
        it("should not execute when enabled is false", async () => {
            const accounts = [{ address: mockAddress1, index: 0 }]
            setupMockSelector(accounts, [])

            renderHook(() => useNotificationRegistration({ enabled: false }))

            // Wait for useEffect to complete before asserting negative
            await new Promise(resolve => setTimeout(resolve, 100))

            expect(NotificationCenterAPI.registerPushNotification).not.toHaveBeenCalled()
            expect(NotificationCenterAPI.unregisterPushNotification).not.toHaveBeenCalled()
        })
    })

    describe("edge cases", () => {
        it("should handle empty accounts list", async () => {
            const accounts: any[] = []
            const registrations = [{ address: mockAddress1, lastSuccessfulSync: Date.now() }]
            setupMockSelector(accounts, registrations)

            renderHook(() => useNotificationRegistration({ enabled: true }))

            await waitFor(() =>
                expect(NotificationCenterAPI.unregisterPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress1],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                }),
            )
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("removeRegistrations"),
                    payload: expect.arrayContaining([mockAddress1]),
                }),
            )
        })

        it("should handle empty registrations list", async () => {
            const accounts = [{ address: mockAddress1, index: 0 }]
            setupMockSelector(accounts, [])

            renderHook(() => useNotificationRegistration({ enabled: true }))

            await waitFor(() =>
                expect(NotificationCenterAPI.registerPushNotification).toHaveBeenCalledWith({
                    walletAddresses: [mockAddress1],
                    subscriptionId: mockSubscriptionId,
                    baseUrl: mockBaseUrl,
                }),
            )
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining("upsertRegistrations"),
                    payload: expect.arrayContaining([
                        expect.objectContaining({
                            address: mockAddress1,
                            lastSuccessfulSync: expect.any(Number),
                            registeredUrl: mockBaseUrl,
                        }),
                    ]),
                }),
            )
        })

        it("should handle registrations with undefined lastSuccessfulSync", async () => {
            const accounts = [{ address: mockAddress1, index: 0 }]
            const registrations = [{ address: mockAddress1, registeredUrl: mockBaseUrl }]
            setupMockSelector(accounts, registrations)

            renderHook(() => useNotificationRegistration({ enabled: true }))

            // Wait for useEffect to complete before asserting negative
            await new Promise(resolve => setTimeout(resolve, 100))

            expect(NotificationCenterAPI.registerPushNotification).not.toHaveBeenCalled()
            expect(NotificationCenterAPI.unregisterPushNotification).not.toHaveBeenCalled()
        })
    })
})
