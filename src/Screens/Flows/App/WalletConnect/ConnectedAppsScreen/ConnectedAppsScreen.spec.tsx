import { act, fireEvent, screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { DeleteUnderlay } from "~Components/Reusable/DeleteUnderlay"
import { ConnectedAppsScreen } from "./ConnectedAppsScreen"

const { sessions } = TestHelpers.data

const removeConnectedDiscoveryApp = jest
    .fn()
    .mockImplementation(payload => ({ type: "discovery/removeConnectedDiscoveryApp", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    removeConnectedDiscoveryApp: (...args: any[]) => removeConnectedDiscoveryApp(...args),
}))

jest.mock("~Components/Providers/WalletConnectProvider", () => ({
    ...jest.requireActual("~Components/Providers/WalletConnectProvider"),
    useWalletConnect: jest.fn(),
}))

describe("ConnectedAppsScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render correctly", async () => {
        ;(useWalletConnect as jest.Mock).mockReturnValue({ activeSessions: {}, disconnectSession: jest.fn() })
        TestHelpers.render.renderComponentWithProps(<ConnectedAppsScreen />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        featured: [
                            {
                                amountOfNavigations: 1,
                                createAt: Date.now(),
                                href: "https://vechain.org",
                                isCustom: false,
                                name: "TEST",
                            },
                            {
                                amountOfNavigations: 1,
                                createAt: Date.now(),
                                href: "https://mugshot.vet",
                                isCustom: false,
                                name: "TEST 2",
                            },
                        ],
                        connectedApps: [
                            {
                                connectedTime: Date.now(),
                                href: "vechain.org",
                                name: "Test connected app",
                            },
                            {
                                connectedTime: Date.now(),
                                href: "mugshot.vet",
                                name: "Mugshot",
                            },
                        ],
                        bannerInteractions: {},
                        custom: [],

                        favoriteRefs: [],
                        hasOpenedDiscovery: true,
                        tabsManager: { currentTabId: null, tabs: [] },
                    },
                    externalDapps: {
                        sessions: {
                            "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a": sessions,
                        },
                        blackListedApps: [],
                    },
                },
            },
        })

        expect(await screen.findAllByTestId("CONNECTED_APP_NAME").then(res => res[0])).toHaveTextContent("TEST")
        expect(await screen.findAllByTestId("CONNECTED_APP_DESCRIPTION").then(res => res[0])).toHaveTextContent(
            "vechain.org",
        )

        await screen.findAllByTestId("DELETE_UNDERLAY_BTN")
        // The underlay only takes touches once its row is swiped open, which swipeable-item never does under Jest.
        act(() => screen.UNSAFE_getAllByType(DeleteUnderlay)[0].props.onPress())

        expect(screen.getByTestId("CONFIRM_DISCONNECT_APP_DESCRIPTION")).toBeVisible()

        await act(() => {
            fireEvent.press(screen.getByTestId("CONFIRM_DISCONNECT_APP_APPLY"))
        })

        expect(removeConnectedDiscoveryApp).toHaveBeenCalledWith({
            href: "vechain.org",
            name: "TEST",
            connectedTime: expect.any(Number),
        })
    })
})
