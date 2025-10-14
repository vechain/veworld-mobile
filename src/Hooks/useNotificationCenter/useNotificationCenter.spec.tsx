import React, { PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, act } from "@testing-library/react-hooks"
import { useNotificationCenter } from "./useNotificationCenter"
import {
    initialNotificationState,
    updateLastSuccessfulRegistration,
    updateLastSubscriptionId,
    updateLastWalletAddresses,
} from "~Storage/Redux/Slices/Notification"
import { DEVICE_TYPE } from "~Model"
import { OneSignal } from "react-native-onesignal"

jest.mock("~Utils/Logger", () => ({
    info: jest.fn(),
    error: jest.fn(),
}))

let mockState: any
const mockDispatch = jest.fn()

jest.mock("~Storage/Redux", () => {
    const notificationSlice = jest.requireActual("~Storage/Redux/Slices/Notification")

    return {
        useAppSelector: (selector: any) => selector(mockState),
        useAppDispatch: () => mockDispatch,
        selectAccounts: (state: any) => state.accounts?.accounts ?? [],
        selectLastSuccessfulRegistration: (state: any) => state.notification?.lastSuccessfulRegistration ?? null,
        selectLastSubscriptionId: (state: any) => state.notification?.lastSubscriptionId ?? null,
        selectLastWalletAddresses: (state: any) => state.notification?.lastWalletAddresses ?? null,
        updateLastSuccessfulRegistration: notificationSlice.updateLastSuccessfulRegistration,
        updateLastSubscriptionId: notificationSlice.updateLastSubscriptionId,
        updateLastWalletAddresses: notificationSlice.updateLastWalletAddresses,
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
const ROOT_ADDRESS = "0x2222222222222222222222222222222222222222"

const createAccount = () => ({
    alias: "Account 0",
    rootAddress: ROOT_ADDRESS,
    address: ACCOUNT_ADDRESS,
    index: 0,
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

const renderUseNotificationCenter = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const hookResult = renderHook(() => useNotificationCenter(), { wrapper })

    return {
        ...hookResult,
        queryClient,
    }
}

const mockGetIdAsync = OneSignal.User.pushSubscription.getIdAsync as jest.Mock

describe("useNotificationCenter", () => {
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
        mockState = undefined
        ;(global as any).fetch = jest.fn()
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

        const { result, unmount, queryClient } = renderUseNotificationCenter()

        await act(async () => {
            await result.current.register()
        })

        expect(mockGetIdAsync).not.toHaveBeenCalled()
        expect(global.fetch as jest.Mock).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()

        unmount()
        ;(queryClient as any).clear?.()
    })

    it("skips registration when conditions are unchanged", async () => {
        const now = 1700000000000
        dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)

        mockState = buildState({
            notification: {
                lastSuccessfulRegistration: now - 1000,
                lastSubscriptionId: SUBSCRIPTION_ID,
                lastWalletAddresses: [ACCOUNT_ADDRESS],
            },
        })

        mockGetIdAsync.mockResolvedValue(SUBSCRIPTION_ID)

        const { result, unmount, queryClient } = renderUseNotificationCenter()

        await act(async () => {
            await result.current.register()
        })

        expect(mockGetIdAsync).toHaveBeenCalledTimes(1)
        expect(global.fetch as jest.Mock).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()

        unmount()
        ;(queryClient as any).clear?.()
    })

    it("registers successfully and updates notification state", async () => {
        const now = 1700000100000
        dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now)

        mockState = buildState()

        mockGetIdAsync.mockResolvedValue(SUBSCRIPTION_ID)
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn(),
        })

        const { result, unmount, queryClient } = renderUseNotificationCenter()

        await act(async () => {
            await result.current.register()
        })

        expect(global.fetch as jest.Mock).toHaveBeenCalledTimes(1)
        const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
        expect(url).toBe("https://notifications.dev/api/v1/push-registrations")
        expect(options).toMatchObject({
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
        const parsedBody = JSON.parse(options.body as string)
        expect(parsedBody).toEqual({
            walletAddresses: [ACCOUNT_ADDRESS],
            provider: "onesignal",
            providerDetails: {
                appId: "onesignal-dev",
                subscriptionId: SUBSCRIPTION_ID,
            },
        })

        expect(mockDispatch).toHaveBeenCalledTimes(3)
        expect(mockDispatch).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                type: updateLastSuccessfulRegistration.type,
                payload: now,
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
                type: updateLastWalletAddresses.type,
                payload: [ACCOUNT_ADDRESS],
            }),
        )

        unmount()
        ;(queryClient as any).clear?.()
    })
})
