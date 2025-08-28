/* eslint-disable jest/no-disabled-tests */
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { TestWrapper, TestHelpers } from "~Test"
import { FavoritesBottomSheet } from "./FavoritesBottomSheet"
import { DiscoveryDApp } from "~Constants"
import { screen } from "@testing-library/react-native"

const { renderComponentWithProps } = TestHelpers.render

const mockDApps: DiscoveryDApp[] = [
    {
        id: "dapp1",
        name: "Test DApp 1",
        desc: "Test Description 1",
        href: "https://dapp1.com",
        isCustom: false,
        createAt: 0,
        amountOfNavigations: 0,
        veBetterDaoId: "dapp1",
        iconUri: "https://dapp1.com/icon.png",
    },
    {
        id: "dapp2",
        name: "Test DApp 2",
        desc: "Test Description 2",
        href: "https://dapp2.com",
        isCustom: false,
        createAt: 0,
        amountOfNavigations: 0,
        veBetterDaoId: "dapp2",
    },
    {
        id: "dapp3",
        name: "Test DApp 3",
        desc: "Test Description 3",
        href: "https://dapp3.com",
        isCustom: false,
        createAt: 0,
        amountOfNavigations: 0,
        veBetterDaoId: "dapp3",
    },
]

describe.skip("FavoritesBottomSheet", () => {
    describe.skip("Rendering", () => {
        it("should render correctly with favorite dApps", async () => {
            const ref = { current: null } as React.RefObject<BottomSheetModalMethods>
            renderComponentWithProps(<FavoritesBottomSheet ref={ref} onClose={jest.fn()} />, {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        discovery: {
                            favorites: mockDApps,
                            featured: mockDApps,
                            custom: [],
                            bannerInteractions: {},
                            connectedApps: [],
                            hasOpenedDiscovery: true,
                            tabsManager: {
                                currentTabId: null,
                                tabs: [],
                            },
                        },
                    },
                },
            })

            const flatList = await screen.getByTestId("draggable-flatlist")

            expect(flatList).toBeTruthy()
            // expect(screen.getByTestId("favorite-dapp-card-dapp1")).toBeTruthy()
            // expect(screen.getByTestId("favorite-dapp-card-dapp2")).toBeTruthy()
            // expect(screen.getByTestId("favorite-dapp-card-dapp3")).toBeTruthy()
        })

        it("should render empty state when no favorites", () => {
            const ref = { current: null } as React.RefObject<BottomSheetModalMethods>
            const { getByTestId } = renderComponentWithProps(<FavoritesBottomSheet ref={ref} onClose={jest.fn()} />, {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        discovery: {
                            favorites: [],
                            featured: [],
                            custom: [],
                            bannerInteractions: {},
                            connectedApps: [],
                            hasOpenedDiscovery: true,
                            tabsManager: {
                                currentTabId: null,
                                tabs: [],
                            },
                        },
                    },
                },
            })

            expect(getByTestId("empty-results")).toBeTruthy()
        })

        // it("should render reorder button in normal mode", () => {
        //     const { getByTestId } = renderComponent()
        //     expect(getByTestId("reorder-button")).toBeTruthy()
        // })
    })
})
