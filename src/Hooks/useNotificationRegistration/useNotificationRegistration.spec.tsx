import React, { PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook } from "@testing-library/react-hooks"
import { useNotificationRegistration } from "./useNotificationRegistration"
import {
    initialNotificationState,
    updateWalletRegistrations,
    updateLastFullRegistration,
    updateLastSubscriptionId,
} from "~Storage/Redux/Slices/Notification"
import { DEVICE_TYPE } from "~Model"
import { OneSignal } from "react-native-onesignal"
import { registerPushNotification } from "~Networking/NotificationCenter/NotificationCenterAPI"

jest.mock("~Utils/Logger", () => ({
    info: jest.fn(),
    error: jest.fn(),
}))

jest.mock("~Networking/NotificationCenter/NotificationCenterAPI", () => ({
    registerPushNotification: jest.fn().mockResolvedValue(undefined),
}))

let mockState: any
const mockDispatch = jest.fn()

jest.mock("~Storage/Redux", () => {
    const notificationSlice = jest.requireActual("~Storage/Redux/Slices/Notification")

    return {
        useAppSelector: (selector: any) => selector(mockState),
        useAppDispatch: () => mockDispatch,
        selectAccounts: (state: any) => state.accounts?.accounts ?? [],
        selectWalletRegistrations: (state: any) => state.notification?.walletRegistrations ?? null,
        selectLastFullRegistration: (state: any) => state.notification?.lastFullRegistration ?? null,
        selectLastSubscriptionId: (state: any) => state.notification?.lastSubscriptionId ?? null,
        updateWalletRegistrations: notificationSlice.updateWalletRegistrations,
        updateLastFullRegistration: notificationSlice.updateLastFullRegistration,
        updateLastSubscriptionId: notificationSlice.updateLastSubscriptionId,
    }
})

jest.mock("react-native-onesignal", () => {
    const mockPushSubscription = {
        getIdAsync: jest.fn(),
        getOptedInAsync: jest.fn().mockResolvedValue(false),
        optIn: jest.fn(),
        optOut: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    }

    return {
        LogLevel: {
            Debug: "debug",
            None: "none",
        },
        OneSignal: {
            Debug: {
                setLogLevel: jest.fn(),
            },
            initialize: jest.fn(),
            Notifications: {
                getPermissionAsync: jest.fn().mockResolvedValue(false),
                requestPermission: jest.fn().mockResolvedValue(false),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            },
            User: {
                pushSubscription: mockPushSubscription,
                getTags: jest.fn().mockResolvedValue({}),
                addTag: jest.fn(),
                removeTag: jest.fn(),
                removeTags: jest.fn(),
            },
        },
        NotificationClickEvent: jest.fn(),
        PushSubscriptionChangedState: jest.fn(),
    }
})

const ACCOUNT_ADDRESS = "0x1111111111111111111111111111111111111111"
const ACCOUNT_ADDRESS_2 = "0x2222222222222222222222222222222222222222"
const ACCOUNT_ADDRESS_3 = "0x3333333333333333333333333333333333333333"
const ACCOUNT_ADDRESS_4 = "0x4444444444444444444444444444444444444444"
const ACCOUNT_ADDRESS_5 = "0x5555555555555555555555555555555555555555"
const ACCOUNT_ADDRESS_6 = "0x6666666666666666666666666666666666666666"
const ACCOUNT_ADDRESS_7 = "0x7777777777777777777777777777777777777777"
const ROOT_ADDRESS = "0x9999999999999999999999999999999999999999"

const createAccount = (address = ACCOUNT_ADDRESS, index = 0) => ({
    alias: `Account ${index}`,
    rootAddress: ROOT_ADDRESS,
    address,
    index,
    visible: true,
})

const createDevice = () => ({
    alias: "Device 0",
    rootAddress: ROOT_ADDRESS,
    type: DEVICE_TYPE.LOCAL_MNEMONIC,
    xPub: {
        chainCode: "0xchain",
        publicKey: "0xpub",
    },
    index: 0,
    wallet: "{}",
    position: 0,
})

const buildState = ({
    accounts = [createAccount()],
    devices = accounts.length > 0 ? [createDevice()] : [],
    notification = {},
}: {
    accounts?: any[]
    devices?: any[]
    notification?: Partial<typeof initialNotificationState>
} = {}) => ({
    accounts: {
        accounts,
        selectedAccount: accounts[0]?.address,
    },
    devices,
    notification: {
        ...initialNotificationState,
        ...notification,
    },
})

const renderUseNotificationRegistration = (enabled: boolean = true) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: Infinity },
            mutations: { retry: false },
        },
    })

    const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const hookResult = renderHook(() => useNotificationRegistration({ enabled }), { wrapper })

    return {
        ...hookResult,
        queryClient,
    }
}

const mockGetIdAsync = OneSignal.User.pushSubscription.getIdAsync as jest.Mock

describe("useNotificationRegistration", () => {
    const SUBSCRIPTION_ID = "subscription-123"
    let dateNowSpy: jest.SpyInstance<number, []> | undefined

    beforeAll(() => {
        ;(globalThis as any).__DEV__ = true
        process.env.NOTIFICATION_CENTER_REGISTER_DEV = "https://notifications.dev"
        process.env.ONE_SIGNAL_APP_ID = "onesignal-dev"
    })

    beforeEach(() => {
        mockDispatch.mockClear()
        mockGetIdAsync.mockReset()
        ;(registerPushNotification as jest.Mock).mockClear()
        mockState = undefined
        dateNowSpy?.mockRestore()
        dateNowSpy = undefined
    })

    afterEach(() => {
        dateNowSpy?.mockRestore()
    })

    it("does not attempt registration when there are no accounts", async () => {
        mockState = buildState({
            accounts: [],
            devices: [],
            notification: initialNotificationState,
        })

        const { unmount, queryClient, waitFor } = renderUseNotificationRegistration()

        await waitFor(() => {
            expect(mockGetIdAsync).not.toHaveBeenCalled()
            expect(registerPushNotification).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        unmount()
        ;(queryClient as any).clear?.()
    })

    it("skips registration when conditions are unchanged", async () => {
        const now = 1700000000000
        dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)

        mockState = buildState({
            notification: {
                walletRegistrations: {
                    [ACCOUNT_ADDRESS]: now - 1000, // Recently registered
                },
                lastFullRegistration: now - 1000,
                lastSubscriptionId: SUBSCRIPTION_ID,
            },
        })

        mockGetIdAsync.mockResolvedValue(SUBSCRIPTION_ID)

        const { unmount, queryClient, waitFor } = renderUseNotificationRegistration()

        await waitFor(() => {
            expect(mockGetIdAsync).toHaveBeenCalledTimes(1)
            expect(registerPushNotification).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        unmount()
        ;(queryClient as any).clear?.()
    })

    it("registers successfully and updates notification state", async () => {
        const now = 1700000100000
        dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)

        mockState = buildState()

        mockGetIdAsync.mockResolvedValue(SUBSCRIPTION_ID)

        const { unmount, queryClient, waitFor } = renderUseNotificationRegistration()

        await waitFor(() => {
            expect(registerPushNotification).toHaveBeenCalledTimes(1)
            expect(mockDispatch).toHaveBeenCalledTimes(3)
        })

        expect(registerPushNotification).toHaveBeenCalledWith({
            networkType: "testnet",
            walletAddresses: [ACCOUNT_ADDRESS],
            subscriptionId: SUBSCRIPTION_ID,
        })

        expect(mockDispatch).toHaveBeenCalledTimes(3)
        expect(mockDispatch).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                type: updateWalletRegistrations.type,
                payload: { addresses: [ACCOUNT_ADDRESS], timestamp: now },
            }),
        )
        expect(mockDispatch).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                type: updateLastSubscriptionId.type,
                payload: SUBSCRIPTION_ID,
            }),
        )
        expect(mockDispatch).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                type: updateLastFullRegistration.type,
                payload: now,
            }),
        )

        unmount()
        ;(queryClient as any).clear?.()
    })

    describe("batching", () => {
        it("registers 7 wallets in 2 batches (5 + 2)", async () => {
            const now = 1700000100000
            dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)

            const accounts = [
                createAccount(ACCOUNT_ADDRESS, 0),
                createAccount(ACCOUNT_ADDRESS_2, 1),
                createAccount(ACCOUNT_ADDRESS_3, 2),
                createAccount(ACCOUNT_ADDRESS_4, 3),
                createAccount(ACCOUNT_ADDRESS_5, 4),
                createAccount(ACCOUNT_ADDRESS_6, 5),
                createAccount(ACCOUNT_ADDRESS_7, 6),
            ]

            mockState = buildState({ accounts })

            mockGetIdAsync.mockResolvedValue(SUBSCRIPTION_ID)

            const { unmount, queryClient, waitFor } = renderUseNotificationRegistration()

            await waitFor(() => {
                // Should send 2 requests (batches)
                expect(registerPushNotification).toHaveBeenCalledTimes(2)
            })

            // First batch: 5 wallets
            expect((registerPushNotification as jest.Mock).mock.calls[0][0].walletAddresses).toEqual([
                ACCOUNT_ADDRESS,
                ACCOUNT_ADDRESS_2,
                ACCOUNT_ADDRESS_3,
                ACCOUNT_ADDRESS_4,
                ACCOUNT_ADDRESS_5,
            ])

            // Second batch: 2 wallets
            expect((registerPushNotification as jest.Mock).mock.calls[1][0].walletAddresses).toEqual([ACCOUNT_ADDRESS_6, ACCOUNT_ADDRESS_7])

            // Should dispatch 5 times:
            // 2 x updateWalletRegistrations (one per batch)
            // 2 x updateLastSubscriptionId (one per batch)
            // 1 x updateLastFullRegistration
            expect(mockDispatch).toHaveBeenCalledTimes(5)

            // First batch registration
            expect(mockDispatch).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    type: updateWalletRegistrations.type,
                    payload: {
                        addresses: [
                            ACCOUNT_ADDRESS,
                            ACCOUNT_ADDRESS_2,
                            ACCOUNT_ADDRESS_3,
                            ACCOUNT_ADDRESS_4,
                            ACCOUNT_ADDRESS_5,
                        ],
                        timestamp: now,
                    },
                }),
            )

            // Second batch registration
            expect(mockDispatch).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining({
                    type: updateWalletRegistrations.type,
                    payload: { addresses: [ACCOUNT_ADDRESS_6, ACCOUNT_ADDRESS_7], timestamp: now },
                }),
            )

            // Last full registration timestamp (after all batches)
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: updateLastFullRegistration.type,
                    payload: now,
                }),
            )

            unmount()
            ;(queryClient as any).clear?.()
        })

        it("only registers new wallet when one is added", async () => {
            const now = 1700000100000
            dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)

            const accounts = [createAccount(ACCOUNT_ADDRESS, 0), createAccount(ACCOUNT_ADDRESS_2, 1)]

            mockState = buildState({
                accounts,
                notification: {
                    walletRegistrations: {
                        [ACCOUNT_ADDRESS]: now - 1000, // Already registered
                    },
                    lastFullRegistration: now - 1000,
                    lastSubscriptionId: SUBSCRIPTION_ID,
                },
            })

            mockGetIdAsync.mockResolvedValue(SUBSCRIPTION_ID)

            const { unmount, queryClient, waitFor } = renderUseNotificationRegistration()

            await waitFor(() => {
                // Should only send 1 request for the new wallet
                expect(registerPushNotification).toHaveBeenCalledTimes(1)
            })

            expect((registerPushNotification as jest.Mock).mock.calls[0][0].walletAddresses).toEqual([ACCOUNT_ADDRESS_2])

            // Should dispatch 2 times:
            // 1 x updateWalletRegistrations (just the new wallet)
            // 1 x updateLastSubscriptionId
            // No updateLastFullRegistration (not a full registration)
            expect(mockDispatch).toHaveBeenCalledTimes(2)

            expect(mockDispatch).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    type: updateWalletRegistrations.type,
                    payload: { addresses: [ACCOUNT_ADDRESS_2], timestamp: now },
                }),
            )

            unmount()
            ;(queryClient as any).clear?.()
        })

        it("re-registers all wallets after 30 days in batches", async () => {
            const now = 1700000100000
            const thirtyOneDaysAgo = now - 31 * 24 * 60 * 60 * 1000
            dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)

            const accounts = [
                createAccount(ACCOUNT_ADDRESS, 0),
                createAccount(ACCOUNT_ADDRESS_2, 1),
                createAccount(ACCOUNT_ADDRESS_3, 2),
                createAccount(ACCOUNT_ADDRESS_4, 3),
                createAccount(ACCOUNT_ADDRESS_5, 4),
                createAccount(ACCOUNT_ADDRESS_6, 5),
            ]

            mockState = buildState({
                accounts,
                notification: {
                    walletRegistrations: {
                        [ACCOUNT_ADDRESS]: thirtyOneDaysAgo,
                        [ACCOUNT_ADDRESS_2]: thirtyOneDaysAgo,
                        [ACCOUNT_ADDRESS_3]: thirtyOneDaysAgo,
                        [ACCOUNT_ADDRESS_4]: thirtyOneDaysAgo,
                        [ACCOUNT_ADDRESS_5]: thirtyOneDaysAgo,
                        [ACCOUNT_ADDRESS_6]: thirtyOneDaysAgo,
                    },
                    lastFullRegistration: thirtyOneDaysAgo,
                    lastSubscriptionId: SUBSCRIPTION_ID,
                },
            })

            mockGetIdAsync.mockResolvedValue(SUBSCRIPTION_ID)

            const { unmount, queryClient, waitFor } = renderUseNotificationRegistration()

            await waitFor(() => {
                // Should send 2 requests (5 + 1)
                expect(registerPushNotification).toHaveBeenCalledTimes(2)
            })

            expect(registerPushNotification).toHaveBeenCalledTimes(2)

            // First batch: 5 wallets
            expect((registerPushNotification as jest.Mock).mock.calls[0][0].walletAddresses).toHaveLength(5)

            // Second batch: 1 wallet
            expect((registerPushNotification as jest.Mock).mock.calls[1][0].walletAddresses).toHaveLength(1)

            // Should update lastFullRegistration
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: updateLastFullRegistration.type,
                    payload: now,
                }),
            )

            unmount()
            ;(queryClient as any).clear?.()
        })

        it("re-registers all wallets when subscription ID changes", async () => {
            const now = 1700000100000
            dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)
            const NEW_SUBSCRIPTION_ID = "new-subscription-456"

            const accounts = [
                createAccount(ACCOUNT_ADDRESS, 0),
                createAccount(ACCOUNT_ADDRESS_2, 1),
                createAccount(ACCOUNT_ADDRESS_3, 2),
                createAccount(ACCOUNT_ADDRESS_4, 3),
                createAccount(ACCOUNT_ADDRESS_5, 4),
                createAccount(ACCOUNT_ADDRESS_6, 5),
            ]

            mockState = buildState({
                accounts,
                notification: {
                    walletRegistrations: {
                        [ACCOUNT_ADDRESS]: now - 1000,
                        [ACCOUNT_ADDRESS_2]: now - 1000,
                        [ACCOUNT_ADDRESS_3]: now - 1000,
                        [ACCOUNT_ADDRESS_4]: now - 1000,
                        [ACCOUNT_ADDRESS_5]: now - 1000,
                        [ACCOUNT_ADDRESS_6]: now - 1000,
                    },
                    lastFullRegistration: now - 1000,
                    lastSubscriptionId: SUBSCRIPTION_ID, // Old subscription ID
                },
            })

            mockGetIdAsync.mockResolvedValue(NEW_SUBSCRIPTION_ID) // New subscription ID

            const { unmount, queryClient, waitFor } = renderUseNotificationRegistration()

            await waitFor(() => {
                // Should re-register all wallets in 2 batches despite recent registration
                expect(registerPushNotification).toHaveBeenCalledTimes(2)
            })

            // Should update subscription ID
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: updateLastSubscriptionId.type,
                    payload: NEW_SUBSCRIPTION_ID,
                }),
            )

            unmount()
            ;(queryClient as any).clear?.()
        })

        it("retries failed wallets on next registration attempt", async () => {
            const now = 1700000100000
            dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)

            const accounts = [
                createAccount(ACCOUNT_ADDRESS, 0),
                createAccount(ACCOUNT_ADDRESS_2, 1),
                createAccount(ACCOUNT_ADDRESS_3, 2),
            ]

            // Simulate scenario where first wallet succeeded but others failed previously
            // lastFullRegistration exists so it won't re-register all wallets
            mockState = buildState({
                accounts,
                notification: {
                    walletRegistrations: {
                        // Only first wallet was registered
                        [ACCOUNT_ADDRESS]: now - 1000,
                        // Wallets 2 and 3 have no timestamps (failed previously)
                    },
                    lastFullRegistration: now - 100000, // Had attempted full registration before
                    lastSubscriptionId: SUBSCRIPTION_ID,
                },
            })

            mockGetIdAsync.mockResolvedValue(SUBSCRIPTION_ID)

            const { unmount, queryClient, waitFor } = renderUseNotificationRegistration()

            await waitFor(() => {
                // Should only try to register the 2 failed wallets
                expect(registerPushNotification).toHaveBeenCalledTimes(1)
            })

            expect((registerPushNotification as jest.Mock).mock.calls[0][0].walletAddresses).toEqual([ACCOUNT_ADDRESS_2, ACCOUNT_ADDRESS_3])

            // Should NOT mark as full registration since we only registered 2 wallets, not all 3
            // (wallet 1 was already registered)
            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    type: updateLastFullRegistration.type,
                }),
            )

            unmount()
            ;(queryClient as any).clear?.()
        })

        it("handles address case-insensitivity correctly", async () => {
            const now = 1700000100000
            dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)

            const LOWERCASE_ADDRESS = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            const UPPERCASE_ADDRESS = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            const MIXED_CASE_ADDRESS = "0xCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc"

            const accounts = [
                createAccount(LOWERCASE_ADDRESS, 0),
                createAccount(UPPERCASE_ADDRESS, 1),
                createAccount(MIXED_CASE_ADDRESS, 2),
            ]

            // Simulate that addresses were previously stored (with different casing)
            mockState = buildState({
                accounts,
                notification: {
                    walletRegistrations: {
                        // Stored in normalized (lowercase) form
                        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": now - 1000,
                        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb": now - 1000,
                        // This one is missing (will need to be registered)
                    },
                    lastFullRegistration: now - 1000,
                    lastSubscriptionId: SUBSCRIPTION_ID,
                },
            })

            mockGetIdAsync.mockResolvedValue(SUBSCRIPTION_ID)

            const { unmount, queryClient, waitFor } = renderUseNotificationRegistration()

            await waitFor(() => {
                // Should only register the one missing address (MIXED_CASE_ADDRESS)
                expect(registerPushNotification).toHaveBeenCalledTimes(1)
            })

            expect((registerPushNotification as jest.Mock).mock.calls[0][0].walletAddresses).toEqual([MIXED_CASE_ADDRESS])

            // Should store the address in normalized (lowercase) form
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: updateWalletRegistrations.type,
                    payload: {
                        addresses: [MIXED_CASE_ADDRESS],
                        timestamp: now,
                    },
                }),
            )

            unmount()
            ;(queryClient as any).clear?.()
        })
    })
})
