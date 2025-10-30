import React, { PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook } from "@testing-library/react-hooks"
import { OneSignal } from "react-native-onesignal"
import { unregisterPushNotification } from "~Networking/NotificationCenter/NotificationCenterAPI"
import { useNotificationUnregistration } from "./useNotificationUnregistration"

jest.mock("~Utils/Logger", () => ({
    info: jest.fn(),
    error: jest.fn(),
}))

jest.mock("~Networking/NotificationCenter/NotificationCenterAPI", () => ({
    unregisterPushNotification: jest.fn(),
}))

jest.mock("~Utils", () => ({
    error: jest.fn(),
    info: jest.fn(),
    AccountUtils: {
        isObservedAccount: jest.fn(() => false),
    },
}))

jest.mock("~Utils/HexUtils", () => ({
    normalize: jest.fn((addr: string) => addr.toLowerCase()),
}))

let mockState: any
const mockDispatch = jest.fn()

jest.mock("~Storage/Redux", () => {
    return {
        useAppSelector: (selector: any) => selector(mockState),
        useAppDispatch: () => mockDispatch,
        selectAccounts: (state: any) => state.accounts?.accounts ?? [],
        selectWalletRegistrations: (state: any) => state.notification?.walletRegistrations ?? null,
        selectPendingUnregistrations: (state: any) => state.notification?.pendingUnregistrations ?? [],
        selectUnregistrationAttempts: (state: any) => state.notification?.unregistrationAttempts ?? {},
        addPendingUnregistrations: (addresses: string[]) => ({
            type: "notification/addPendingUnregistrations",
            payload: addresses,
        }),
        removePendingUnregistrations: (addresses: string[]) => ({
            type: "notification/removePendingUnregistrations",
            payload: addresses,
        }),
        incrementUnregistrationAttempts: (address: string) => ({
            type: "notification/incrementUnregistrationAttempts",
            payload: address,
        }),
        removeFromWalletRegistrations: (addresses: string[]) => ({
            type: "notification/removeFromWalletRegistrations",
            payload: addresses,
        }),
    }
})

jest.mock("react-native-onesignal", () => {
    const mockPushSubscription = {
        getIdAsync: jest.fn().mockResolvedValue("subscription-id"),
    }

    return {
        OneSignal: {
            User: {
                pushSubscription: mockPushSubscription,
            },
        },
    }
})

const wrapper = ({ children }: PropsWithChildren) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe("useNotificationUnregistration", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockDispatch.mockClear()
    })

    it("should process pending unregistrations in batches", async () => {
        mockState = {
            accounts: {
                accounts: [{ address: "0x1234", name: "Wallet 1" }],
            },
            notification: {
                walletRegistrations: {},
                pendingUnregistrations: ["0x2", "0x3", "0x4", "0x5", "0x6", "0x7"],
                unregistrationAttempts: {},
            },
        }
        ;(unregisterPushNotification as jest.Mock).mockResolvedValue(undefined)

        renderHook(() => useNotificationUnregistration({ enabled: true }), { wrapper })

        await new Promise(resolve => setTimeout(resolve, 100))

        // Should be called twice - once for first 5, once for remaining 1
        expect(unregisterPushNotification).toHaveBeenCalledTimes(2)
    })

    it("should not process unregistrations when disabled", async () => {
        mockState = {
            accounts: {
                accounts: [{ address: "0x1234", name: "Wallet 1" }],
            },
            notification: {
                walletRegistrations: {},
                pendingUnregistrations: ["0x2", "0x3"],
                unregistrationAttempts: {},
            },
        }

        renderHook(() => useNotificationUnregistration({ enabled: false }), { wrapper })

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(unregisterPushNotification).not.toHaveBeenCalled()
    })

    it("should remove addresses from queue after successful unregistration", async () => {
        mockState = {
            accounts: {
                accounts: [{ address: "0x1234", name: "Wallet 1" }],
            },
            notification: {
                walletRegistrations: {},
                pendingUnregistrations: ["0x2", "0x3"],
                unregistrationAttempts: {},
            },
        }
        ;(unregisterPushNotification as jest.Mock).mockResolvedValue(undefined)

        renderHook(() => useNotificationUnregistration({ enabled: true }), { wrapper })

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "notification/removePendingUnregistrations",
            }),
        )
    })

    it("should filter out addresses that exceeded max retries", async () => {
        mockState = {
            accounts: {
                accounts: [{ address: "0x1234", name: "Wallet 1" }],
            },
            notification: {
                walletRegistrations: {},
                pendingUnregistrations: ["0x2", "0x3"],
                unregistrationAttempts: {
                    "0x2": 10, // Exceeded max retries
                    "0x3": 2,
                },
            },
        }
        ;(unregisterPushNotification as jest.Mock).mockResolvedValue(undefined)

        renderHook(() => useNotificationUnregistration({ enabled: true }), { wrapper })

        await new Promise(resolve => setTimeout(resolve, 100))

        // Should only unregister 0x3, not 0x2
        expect(unregisterPushNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                walletAddresses: ["0x3"],
            }),
        )
    })
})
