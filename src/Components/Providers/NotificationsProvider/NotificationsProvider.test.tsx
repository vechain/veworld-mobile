import React from "react"
import { renderHook, waitFor, act } from "@testing-library/react-native"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { NavigationContainer } from "@react-navigation/native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { NotificationsProvider, useNotifications } from "./NotificationsProvider"
import { reducer, newStorage, NftSlice, NftSliceState } from "~Storage/Redux"
import { MMKV } from "react-native-mmkv"
import { PersistConfig } from "redux-persist/es/types"
import { OneSignal } from "react-native-onesignal"
import { FeatureFlagsContext, initialState as ffInitialState } from "../FeatureFlagsProvider"

// Mock axios before any imports use it
const mockAxiosRequest = jest.fn()
jest.mock("axios", () => ({
    create: jest.fn(() => ({
        request: (...args: unknown[]) => mockAxiosRequest(...args),
        get: jest.fn(),
    })),
}))

const mockGetIdAsync = jest.fn()
;(OneSignal.User.pushSubscription as any).getIdAsync = mockGetIdAsync

const nftPersistence: PersistConfig<NftSliceState> = {
    key: NftSlice.name,
    storage: newStorage(new MMKV({ id: "test-notifications-nft-storage" })),
    whitelist: ["blackListedCollections"],
}

const defaultNotificationState = {
    feautureEnabled: true,
    permissionEnabled: true,
    optedIn: true,
    dappVisitCounter: {},
    userTags: {},
    dappNotifications: true,
    registrations: { ids: [], entities: {} },
    disabledCategories: [] as string[],
}

const createStore = (notificationOverrides = {}, userPreferencesOverrides = {}) =>
    configureStore({
        reducer: reducer(nftPersistence),
        middleware: getDefaultMiddleware => getDefaultMiddleware(),
        preloadedState: {
            notification: {
                ...defaultNotificationState,
                ...notificationOverrides,
            },
            userPreferences: userPreferencesOverrides,
        } as any,
    })

const createWrapper =
    (store: ReturnType<typeof createStore>, pushNotificationEnabled = true) =>
    ({ children }: { children: React.ReactNode }) => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })

        return (
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <FeatureFlagsContext.Provider
                        value={{
                            ...ffInitialState,
                            isLoading: false,
                            pushNotificationFeature: { enabled: pushNotificationEnabled },
                        }}>
                        <NavigationContainer>
                            <NotificationsProvider>{children}</NotificationsProvider>
                        </NavigationContainer>
                    </FeatureFlagsContext.Provider>
                </QueryClientProvider>
            </Provider>
        )
    }

describe("NotificationsProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.NOTIFICATION_CENTER_REGISTER_DEV = "https://test-notification-center.com"
        process.env.ONE_SIGNAL_APP_ID = "test-app-id"
    })

    describe("updateNotificationCenterPrefs", () => {
        it("should throw error when feature is not enabled", async () => {
            const store = createStore({ feautureEnabled: false })
            const wrapper = createWrapper(store, false)

            const { result } = renderHook(() => useNotifications(), { wrapper })

            await act(async () => {
                await expect(result.current.updateNotificationCenterPrefs("test-category", true)).rejects.toThrow(
                    "Notifications not initialized",
                )
            })
        })

        it("should throw error when no subscription ID is available", async () => {
            mockGetIdAsync.mockResolvedValueOnce(null)
            const store = createStore()
            const wrapper = createWrapper(store)

            const { result } = renderHook(() => useNotifications(), { wrapper })

            // Wait for initialization
            await waitFor(() => {
                expect(result.current.featureEnabled).toBe(true)
            })

            await act(async () => {
                await expect(result.current.updateNotificationCenterPrefs("test-category", true)).rejects.toThrow(
                    "No subscription ID",
                )
            })
        })

        it("should throw error when no base URL is configured", async () => {
            delete process.env.NOTIFICATION_CENTER_REGISTER_DEV
            delete process.env.NOTIFICATION_CENTER_REGISTER_PROD
            mockGetIdAsync.mockResolvedValueOnce("test-subscription-id")
            const store = createStore()
            const wrapper = createWrapper(store)

            const { result } = renderHook(() => useNotifications(), { wrapper })

            // Wait for initialization
            await waitFor(() => {
                expect(result.current.featureEnabled).toBe(true)
            })

            await act(async () => {
                await expect(result.current.updateNotificationCenterPrefs("test-category", true)).rejects.toThrow(
                    "No base URL configured",
                )
            })
        })

        it("should make PUT request to notification-preferences endpoint when enabling a category", async () => {
            mockGetIdAsync.mockResolvedValueOnce("test-subscription-id")
            mockAxiosRequest.mockResolvedValueOnce({
                data: {
                    subscriptionId: "test-subscription-id",
                    disabledCategories: ["other-category"],
                },
            })

            const store = createStore({ disabledCategories: ["test-category", "other-category"] })
            const wrapper = createWrapper(store)

            const { result } = renderHook(() => useNotifications(), { wrapper })

            await waitFor(() => {
                expect(result.current.featureEnabled).toBe(true)
            })

            await act(async () => {
                await result.current.updateNotificationCenterPrefs("test-category", true)
            })

            expect(mockAxiosRequest).toHaveBeenCalledWith({
                url: "https://test-notification-center.com/api/v1/notification-preferences/test-subscription-id",
                data: { disabledCategories: ["other-category"] },
                method: "PUT",
                timeout: 5000,
            })
        })

        it("should make PUT request to notification-preferences endpoint when disabling a category", async () => {
            mockGetIdAsync.mockResolvedValueOnce("test-subscription-id")
            mockAxiosRequest.mockResolvedValueOnce({
                data: {
                    subscriptionId: "test-subscription-id",
                    disabledCategories: ["test-category"],
                },
            })

            const store = createStore()
            const wrapper = createWrapper(store)

            const { result } = renderHook(() => useNotifications(), { wrapper })

            await waitFor(() => {
                expect(result.current.featureEnabled).toBe(true)
            })

            await act(async () => {
                await result.current.updateNotificationCenterPrefs("test-category", false)
            })

            expect(mockAxiosRequest).toHaveBeenCalledWith({
                url: "https://test-notification-center.com/api/v1/notification-preferences/test-subscription-id",
                data: { disabledCategories: ["test-category"] },
                method: "PUT",
                timeout: 5000,
            })
        })

        it("should not duplicate category in request when disabling an already disabled category", async () => {
            mockGetIdAsync.mockResolvedValueOnce("test-subscription-id")
            mockAxiosRequest.mockResolvedValueOnce({
                data: {
                    subscriptionId: "test-subscription-id",
                    disabledCategories: ["test-category"],
                },
            })

            const store = createStore({ disabledCategories: ["test-category"] })
            const wrapper = createWrapper(store)

            const { result } = renderHook(() => useNotifications(), { wrapper })

            await waitFor(() => {
                expect(result.current.featureEnabled).toBe(true)
            })

            await act(async () => {
                await result.current.updateNotificationCenterPrefs("test-category", false)
            })

            expect(mockAxiosRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { disabledCategories: ["test-category"] },
                }),
            )
        })

        it("should update redux state with response from API", async () => {
            mockGetIdAsync.mockResolvedValueOnce("test-subscription-id")
            mockAxiosRequest.mockResolvedValueOnce({
                data: {
                    subscriptionId: "test-subscription-id",
                    disabledCategories: ["category-from-server"],
                },
            })

            const store = createStore()
            const wrapper = createWrapper(store)

            const { result } = renderHook(() => useNotifications(), { wrapper })

            await waitFor(() => {
                expect(result.current.featureEnabled).toBe(true)
            })

            await act(async () => {
                await result.current.updateNotificationCenterPrefs("test-category", false)
            })

            await waitFor(() => {
                expect(result.current.disabledCategories).toEqual(["category-from-server"])
            })
        })

        it("should use custom URL from userPreferences when available", async () => {
            mockGetIdAsync.mockResolvedValueOnce("test-subscription-id")
            mockAxiosRequest.mockResolvedValueOnce({
                data: {
                    subscriptionId: "test-subscription-id",
                    disabledCategories: [],
                },
            })

            const store = createStore({}, { notificationCenterUrl: "https://custom-url.com" })
            const wrapper = createWrapper(store)

            const { result } = renderHook(() => useNotifications(), { wrapper })

            await waitFor(() => {
                expect(result.current.featureEnabled).toBe(true)
            })

            await act(async () => {
                await result.current.updateNotificationCenterPrefs("test-category", true)
            })

            expect(mockAxiosRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: "https://custom-url.com/api/v1/notification-preferences/test-subscription-id",
                }),
            )
        })
    })
})
