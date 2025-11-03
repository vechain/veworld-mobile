import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { screen } from "@testing-library/react-native"
import { TestWrapper, TestHelpers } from "~Test"
import { FavoritesBottomSheet } from "./FavoritesBottomSheet"
import { DiscoveryDApp } from "~Constants"

const { renderComponentWithProps } = TestHelpers.render

// Mock dependencies
jest.mock("../Hooks", () => ({
    useDAppActions: () => ({
        onDAppPress: jest.fn(),
    }),
}))

jest.mock("react-native-draggable-flatlist", () => {
    const { View } = require("react-native")
    const DraggableFlatList = ({ data, renderItem, ListEmptyComponent, ...props }: any) => {
        if (!data || data.length === 0) {
            return React.createElement(View, { testID: props.testID }, ListEmptyComponent)
        }
        return React.createElement(
            View,
            { testID: props.testID },
            data.map((item: any, index: number) => renderItem({ item, index, isActive: false, drag: jest.fn() })),
        )
    }
    const ScaleDecorator = ({ children }: any) => children
    return {
        __esModule: true,
        default: DraggableFlatList,
        ScaleDecorator,
    }
})

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

describe("FavoritesBottomSheet", () => {
    const mockOnClose = jest.fn()
    const ref = { current: null } as React.RefObject<BottomSheetModalMethods>

    const renderWithFavorites = (favorites: DiscoveryDApp[] = mockDApps) => {
        return renderComponentWithProps(<FavoritesBottomSheet ref={ref} onClose={mockOnClose} />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: {
                        favorites,
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
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("Rendering", () => {
        it("should render correctly with favorite dApps", () => {
            renderWithFavorites()

            expect(screen.getByTestId("draggable-flatlist")).toBeTruthy()
            expect(screen.getByTestId("dapps-list-header")).toBeTruthy()
            expect(screen.getByText("Test DApp 1")).toBeTruthy()
            expect(screen.getByText("Test DApp 2")).toBeTruthy()
        })

        it("should render empty state when no favorites", () => {
            renderWithFavorites([])

            expect(screen.getByTestId("empty-results")).toBeTruthy()
            expect(screen.getByTestId("draggable-flatlist")).toBeTruthy()
        })

        it("should show reorder button in normal mode", () => {
            renderWithFavorites()

            const reorderButton = screen.getByTestId("Reorder-HeaderIcon")
            expect(reorderButton).toBeTruthy()
        })
    })

    describe("Edit Mode", () => {
        it("should have reorder functionality available", () => {
            renderWithFavorites()

            const reorderButton = screen.getByTestId("Reorder-HeaderIcon")
            expect(reorderButton).toBeTruthy()

            expect(reorderButton.props.accessible).toBe(true)
        })
    })

    describe("DApp Interactions", () => {
        it("should display dApp names correctly", () => {
            renderWithFavorites()

            expect(screen.getByText("Test DApp 1")).toBeTruthy()
            expect(screen.getByText("Test DApp 2")).toBeTruthy()
            expect(screen.getByText("Test DApp 3")).toBeTruthy()
        })

        it("should display dApp descriptions correctly", () => {
            renderWithFavorites()

            expect(screen.getByText("Test Description 1")).toBeTruthy()
            expect(screen.getByText("Test Description 2")).toBeTruthy()
            expect(screen.getByText("Test Description 3")).toBeTruthy()
        })
    })

    describe("Component Behavior", () => {
        it("should show correct title", () => {
            renderWithFavorites()

            expect(screen.getByText("Favorites")).toBeTruthy()
        })

        it("should render draggable flatlist for reordering", () => {
            renderWithFavorites()

            const flatList = screen.getByTestId("draggable-flatlist")
            expect(flatList).toBeTruthy()
        })
    })
})
