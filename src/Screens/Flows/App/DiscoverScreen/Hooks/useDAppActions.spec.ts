import { renderHook, act } from "@testing-library/react-hooks"
import { useDAppActions } from "./useDAppActions"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { VbdDApp, NETWORK_TYPE } from "~Model"

const mockTrack = jest.fn()
const mockDispatch = jest.fn()
const mockAddVisitedUrl = jest.fn()
const mockCheckPermissions = jest.fn().mockResolvedValue(true)
const mockNavigateWithTab = jest.fn()

jest.mock("~Hooks", () => ({
    useAnalyticTracking: () => mockTrack,
    useCameraPermissions: () => ({ checkPermissions: mockCheckPermissions }),
    useVisitedUrls: () => ({ addVisitedUrl: mockAddVisitedUrl }),
}))

jest.mock("~Hooks/useBrowserTab", () => ({
    useBrowserTab: () => ({ navigateWithTab: mockNavigateWithTab }),
}))

jest.mock("~Storage/Redux", () => ({
    addNavigationToDApp: jest.fn(payload => ({ type: "addNavigationToDApp", payload })),
    increaseDappVisitCounter: jest.fn(payload => ({ type: "increaseDappVisitCounter", payload })),
    selectSelectedNetwork: jest.fn(),
    selectNotificationFeautureEnabled: jest.fn(),
    useAppDispatch: () => mockDispatch,
    useAppSelector: jest.fn(),
}))

import { useAppSelector } from "~Storage/Redux"

// Helper functions for DRY selector mocking
const setupMainnetWithNotifications = () => {
    ;(useAppSelector as jest.Mock).mockReturnValueOnce({ type: NETWORK_TYPE.MAIN }).mockReturnValueOnce(true)
}

// Factory functions for mock data
const createMockDiscoveryDApp = (overrides: Partial<DiscoveryDApp> = {}): DiscoveryDApp => ({
    name: "Test DApp",
    href: "https://example.com",
    createAt: Date.now(),
    isCustom: false,
    amountOfNavigations: 0,
    ...overrides,
})

const createMockVbdDApp = (overrides: Partial<VbdDApp> = {}): VbdDApp => ({
    id: "test-id",
    name: "Test VBD DApp",
    external_url: "https://example.com",
    description: "Test description",
    teamWalletAddress: "0x1234567890",
    metadataURI: "https://example.com/metadata",
    createdAtTimestamp: Date.now().toString(),
    logo: "https://logo.com",
    banner: "https://banner.com",
    screenshots: [],
    social_urls: [],
    app_urls: [],
    ...overrides,
})

describe("useDAppActions", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("onDAppPress", () => {
        describe("with valid dApp data", () => {
            it("should handle DiscoveryDApp correctly", async () => {
                setupMainnetWithNotifications()

                const mockDapp = createMockDiscoveryDApp({
                    name: "Test Discovery DApp",
                    href: "https://discovery-example.com",
                    veBetterDaoId: "discovery-dapp-id",
                })

                const { result } = renderHook(() => useDAppActions("discover-screen"))

                await act(async () => {
                    await result.current.onDAppPress(mockDapp)
                })

                expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                    url: "https://discovery-example.com",
                })
                expect(mockCheckPermissions).toHaveBeenCalled()
                expect(mockAddVisitedUrl).toHaveBeenCalledWith("https://discovery-example.com")
                expect(mockNavigateWithTab).toHaveBeenCalledWith({
                    url: "https://discovery-example.com",
                    title: "Test Discovery DApp",
                })
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: "increaseDappVisitCounter",
                        payload: { dappId: "discovery-dapp-id" },
                    }),
                )
            })

            it("should handle VbdDApp correctly", async () => {
                setupMainnetWithNotifications()

                const mockDapp = createMockVbdDApp({
                    id: "vbd-dapp-id",
                    name: "Test VBD DApp",
                    external_url: "https://vbd-example.com",
                })

                const { result } = renderHook(() => useDAppActions("apps-screen"))

                await act(async () => {
                    await result.current.onDAppPress(mockDapp)
                })

                expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                    url: "https://vbd-example.com",
                })
                expect(mockCheckPermissions).toHaveBeenCalled()
                expect(mockAddVisitedUrl).toHaveBeenCalledWith("https://vbd-example.com")
                expect(mockNavigateWithTab).toHaveBeenCalledWith({
                    url: "https://vbd-example.com",
                    title: "Test VBD DApp",
                })
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: "increaseDappVisitCounter",
                        payload: { dappId: "vbd-dapp-id" },
                    }),
                )
            })

            it("should dispatch addNavigationToDApp after 1000ms timeout", async () => {
                jest.useFakeTimers()
                setupMainnetWithNotifications()

                const mockDapp = createMockDiscoveryDApp({
                    veBetterDaoId: "test-id",
                })

                const { result } = renderHook(() => useDAppActions("test-screen"))

                await act(async () => {
                    await result.current.onDAppPress(mockDapp)
                })

                expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "addNavigationToDApp" }))

                act(() => {
                    jest.advanceTimersByTime(1000)
                })

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: "addNavigationToDApp",
                    payload: {
                        href: "https://example.com",
                        isCustom: false,
                        sourceScreen: "test-screen",
                    },
                })

                jest.useRealTimers()
            })
        })

        describe("with different dApp types", () => {
            it("should handle custom dapp correctly", async () => {
                jest.useFakeTimers()
                setupMainnetWithNotifications()

                const mockDapp = createMockDiscoveryDApp({
                    name: "Custom DApp",
                    href: "https://custom-example.com",
                    isCustom: true,
                })

                const { result } = renderHook(() => useDAppActions("discover-screen"))

                await act(async () => {
                    await result.current.onDAppPress(mockDapp)
                })

                expect(mockCheckPermissions).not.toHaveBeenCalled()
                expect(mockDispatch).not.toHaveBeenCalledWith(
                    expect.objectContaining({ type: "increaseDappVisitCounter" }),
                )

                act(() => {
                    jest.advanceTimersByTime(1000)
                })

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: "addNavigationToDApp",
                    payload: {
                        href: "https://custom-example.com",
                        isCustom: true,
                        sourceScreen: "discover-screen",
                    },
                })

                jest.useRealTimers()
            })

            it.each([
                { description: "without ID", dappOverrides: {} },
                { description: "with empty ID", dappOverrides: { veBetterDaoId: "" } },
            ])("should handle dapp $description", async ({ dappOverrides }) => {
                setupMainnetWithNotifications()

                const mockDapp = createMockDiscoveryDApp({
                    name: "DApp No ID",
                    href: "https://no-id-example.com",
                    ...dappOverrides,
                })

                const { result } = renderHook(() => useDAppActions("discover-screen"))

                await act(async () => {
                    await result.current.onDAppPress(mockDapp)
                })

                expect(mockCheckPermissions).not.toHaveBeenCalled()
                expect(mockDispatch).not.toHaveBeenCalledWith(
                    expect.objectContaining({ type: "increaseDappVisitCounter" }),
                )
                expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                    url: "https://no-id-example.com",
                })
                expect(mockNavigateWithTab).toHaveBeenCalledWith({
                    url: "https://no-id-example.com",
                    title: "DApp No ID",
                })
            })
        })

        describe("with different network and feature flag conditions", () => {
            it.each([
                {
                    network: NETWORK_TYPE.TEST,
                    notifications: true,
                    shouldDispatch: false,
                    description: "testnet with notifications enabled",
                },
                {
                    network: NETWORK_TYPE.MAIN,
                    notifications: false,
                    shouldDispatch: false,
                    description: "mainnet with notifications disabled",
                },
                {
                    network: NETWORK_TYPE.MAIN,
                    notifications: true,
                    shouldDispatch: true,
                    description: "mainnet with notifications enabled",
                },
            ])(
                "should handle counter dispatch for $description",
                async ({ network, notifications, shouldDispatch }) => {
                    ;(useAppSelector as jest.Mock)
                        .mockReturnValueOnce({ type: network })
                        .mockReturnValueOnce(notifications)

                    const mockDapp = createMockDiscoveryDApp({
                        veBetterDaoId: "test-id",
                    })

                    const { result } = renderHook(() => useDAppActions())

                    await act(async () => {
                        await result.current.onDAppPress(mockDapp)
                    })

                    if (shouldDispatch) {
                        expect(mockDispatch).toHaveBeenCalledWith(
                            expect.objectContaining({
                                type: "increaseDappVisitCounter",
                                payload: { dappId: "test-id" },
                            }),
                        )
                    } else {
                        expect(mockDispatch).not.toHaveBeenCalledWith(
                            expect.objectContaining({ type: "increaseDappVisitCounter" }),
                        )
                    }
                },
            )
        })

        describe("with sourceScreen scenarios", () => {
            it.each([
                { sourceScreen: "custom-source-screen", expected: "custom-source-screen" },
                { sourceScreen: undefined, expected: undefined },
            ])("should handle sourceScreen parameter: $sourceScreen", async ({ sourceScreen, expected }) => {
                jest.useFakeTimers()
                setupMainnetWithNotifications()

                const mockDapp = createMockDiscoveryDApp()
                const { result } = renderHook(() => useDAppActions(sourceScreen))

                await act(async () => {
                    await result.current.onDAppPress(mockDapp)
                })

                act(() => {
                    jest.advanceTimersByTime(1000)
                })

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: "addNavigationToDApp",
                    payload: {
                        href: "https://example.com",
                        isCustom: false,
                        sourceScreen: expected,
                    },
                })

                jest.useRealTimers()
            })
        })

        describe("with permission scenarios", () => {
            it("should handle permission check failure", async () => {
                setupMainnetWithNotifications()
                mockCheckPermissions.mockRejectedValueOnce(new Error("Permission denied"))

                const mockDapp = createMockDiscoveryDApp({
                    veBetterDaoId: "test-id",
                })

                const { result } = renderHook(() => useDAppActions())

                await act(async () => {
                    await expect(result.current.onDAppPress(mockDapp)).rejects.toThrow("Permission denied")
                })

                expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                    url: "https://example.com",
                })
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: "increaseDappVisitCounter",
                        payload: { dappId: "test-id" },
                    }),
                )
            })
        })
    })

    describe("increaseDappCounter functionality", () => {
        it("should increase counter when all conditions are met", () => {
            setupMainnetWithNotifications()

            const mockDapp = createMockDiscoveryDApp({
                veBetterDaoId: "test-id",
            })

            const { result } = renderHook(() => useDAppActions())

            act(() => {
                result.current.onDAppPress(mockDapp)
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "increaseDappVisitCounter",
                    payload: { dappId: "test-id" },
                }),
            )
        })

        it("should not increase counter when dappId is falsy", () => {
            setupMainnetWithNotifications()

            const mockDapp = createMockDiscoveryDApp() // No veBetterDaoId

            const { result } = renderHook(() => useDAppActions())

            act(() => {
                result.current.onDAppPress(mockDapp)
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "increaseDappVisitCounter" }))
        })
    })
})
