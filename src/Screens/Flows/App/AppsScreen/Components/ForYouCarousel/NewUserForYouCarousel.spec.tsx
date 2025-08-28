/* eslint-disable max-len */
import { render } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { NewUserForYouCarousel } from "./NewUserForYouCarousel"

const setSuggestedAppIds = jest.fn().mockImplementation(payload => ({ type: "discovery/setSuggestedAppIds", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    setSuggestedAppIds: (...args: any[]) => setSuggestedAppIds(...args),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
    useNavigationState: jest.fn(),
}))

describe("NewUserForYouCarousel", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should randomize order on first render", () => {
        render(<NewUserForYouCarousel />, { wrapper: TestWrapper })

        expect(setSuggestedAppIds).toHaveBeenCalled()
    })

    it("should not randomize order when apps are already defined and with the same length as the suggested apps", () => {
        TestHelpers.render.renderComponentWithProps(<NewUserForYouCarousel />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        bannerInteractions: {},
                        connectedApps: [],
                        custom: [],
                        favorites: [],
                        featured: [],
                        hasOpenedDiscovery: false,
                        tabsManager: {
                            currentTabId: null,
                            tabs: [],
                        },
                        isNormalUser: true,
                        suggestedAppIds: [
                            "0x899de0d0f0b39e484c8835b2369194c4c102b230c813862db383d44a4efe14d3",
                            "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
                            "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a",
                            "0x6c977a18d427360e27c3fc2129a6942acd4ece2c8aaeaf4690034931dc5ba7f9",
                        ],
                    },
                },
            },
        })

        expect(setSuggestedAppIds).not.toHaveBeenCalled()
    })

    it("should randomize order when apps are already defined but not with the same length as the suggested apps", () => {
        TestHelpers.render.renderComponentWithProps(<NewUserForYouCarousel />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        bannerInteractions: {},
                        connectedApps: [],
                        custom: [],
                        favorites: [],
                        featured: [],
                        hasOpenedDiscovery: false,
                        tabsManager: {
                            currentTabId: null,
                            tabs: [],
                        },
                        isNormalUser: true,
                        suggestedAppIds: [
                            "0x899de0d0f0b39e484c8835b2369194c4c102b230c813862db383d44a4efe14d3",
                            "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
                            "0x6c977a18d427360e27c3fc2129a6942acd4ece2c8aaeaf4690034931dc5ba7f9",
                        ],
                    },
                },
            },
        })

        expect(setSuggestedAppIds).toHaveBeenCalled()
    })
})
