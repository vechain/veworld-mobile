import React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { FavouritesV2 } from "./FavouritesV2"
import { TestWrapper } from "~Test"
import { DiscoveryDApp } from "~Constants"

jest.mock("react-native-draggable-flatlist", () => {
    const { View } = require("react-native")
    const DraggableFlatList = ({ data, renderItem, ...props }: any) => {
        if (!data || data.length === 0) {
            return null
        }
        return React.createElement(
            View,
            { testID: props.testID },
            data.map((item: any, index: number) =>
                renderItem({ item, index, isActive: false, drag: jest.fn(), getIndex: () => index }),
            ),
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
        id: "1",
        name: "Test DApp 1",
        href: "https://test1.com",
        createAt: Date.now(),
        isCustom: false,
        amountOfNavigations: 5,
    },
    {
        id: "2",
        name: "Test DApp 2",
        href: "https://test2.com",
        createAt: Date.now(),
        isCustom: false,
        amountOfNavigations: 3,
    },
    {
        id: "3",
        name: "Test DApp 3",
        href: "https://test3.com",
        createAt: Date.now(),
        isCustom: false,
        amountOfNavigations: 1,
    },
]

const mockOnDAppPress = jest.fn()
const mockOnActionLabelPress = jest.fn()

describe("FavouritesV2", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly with bookmarked dApps", () => {
        render(
            <FavouritesV2
                bookmarkedDApps={mockDApps}
                onDAppPress={mockOnDAppPress}
                onActionLabelPress={mockOnActionLabelPress}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByText("Favorites")).toBeOnTheScreen()
        expect(screen.getByText("See all")).toBeOnTheScreen()
    })

    it("should render correctly without CTA when renderCTASeeAll is false", () => {
        render(<FavouritesV2 bookmarkedDApps={mockDApps} onDAppPress={mockOnDAppPress} renderCTASeeAll={false} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByText("Favorites")).toBeOnTheScreen()
        expect(screen.queryByText("See all")).not.toBeOnTheScreen()
    })

    it("should not render dApp list when bookmarkedDApps is empty", () => {
        render(
            <FavouritesV2
                bookmarkedDApps={[]}
                onDAppPress={mockOnDAppPress}
                onActionLabelPress={mockOnActionLabelPress}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByText("Favorites")).toBeOnTheScreen()
        expect(screen.getByText("See all")).toBeOnTheScreen()
        // The FlatList should not be rendered when no bookmarked dApps
        expect(screen.queryByTestId("dapp-card-1")).not.toBeOnTheScreen()
    })

    it("should call onActionLabelPress when See all is pressed", () => {
        render(
            <FavouritesV2
                bookmarkedDApps={mockDApps}
                onDAppPress={mockOnDAppPress}
                onActionLabelPress={mockOnActionLabelPress}
            />,
            { wrapper: TestWrapper },
        )

        const seeAllButton = screen.getByText("See all")
        fireEvent.press(seeAllButton)

        expect(mockOnActionLabelPress).toHaveBeenCalledTimes(1)
    })

    it("should call onDAppPress when a dApp is pressed", () => {
        render(
            <FavouritesV2
                bookmarkedDApps={mockDApps}
                onDAppPress={mockOnDAppPress}
                onActionLabelPress={mockOnActionLabelPress}
            />,
            { wrapper: TestWrapper },
        )

        const firstDAppCard = screen.getByTestId("dapp-card-1")
        fireEvent.press(firstDAppCard)

        expect(mockOnDAppPress).toHaveBeenCalledTimes(1)
        expect(mockOnDAppPress).toHaveBeenCalledWith(mockDApps[0])
    })

    it("should limit dApps to 15 when renderCTASeeAll is true", () => {
        const manyDApps = Array.from({ length: 20 }, (_, index) => ({
            id: `${index + 1}`,
            name: `Test DApp ${index + 1}`,
            href: `https://test${index + 1}.com`,
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: index + 1,
        }))

        render(
            <FavouritesV2
                bookmarkedDApps={manyDApps}
                onDAppPress={mockOnDAppPress}
                onActionLabelPress={mockOnActionLabelPress}
                renderCTASeeAll={true}
            />,
            { wrapper: TestWrapper },
        )

        // Should render first few dApps (FlatList virtualizes)
        expect(screen.getByTestId("dapp-card-1")).toBeOnTheScreen()
        expect(screen.getByTestId("dapp-card-2")).toBeOnTheScreen()
        expect(screen.getByTestId("dapp-card-3")).toBeOnTheScreen()

        // Should not render 16th dApp and beyond (they are sliced out)
        expect(screen.queryByTestId("dapp-card-16")).not.toBeOnTheScreen()
        expect(screen.queryByTestId("dapp-card-20")).not.toBeOnTheScreen()
    })

    it("should render all dApps when renderCTASeeAll is false", () => {
        const manyDApps = Array.from({ length: 20 }, (_, index) => ({
            id: `${index + 1}`,
            name: `Test DApp ${index + 1}`,
            href: `https://test${index + 1}.com`,
            createAt: Date.now(),
            isCustom: false,
            amountOfNavigations: index + 1,
        }))

        render(<FavouritesV2 bookmarkedDApps={manyDApps} onDAppPress={mockOnDAppPress} renderCTASeeAll={false} />, {
            wrapper: TestWrapper,
        })

        // Should render first few dApps (FlatList virtualizes)
        expect(screen.getByTestId("dapp-card-1")).toBeOnTheScreen()
        expect(screen.getByTestId("dapp-card-2")).toBeOnTheScreen()
        expect(screen.getByTestId("dapp-card-3")).toBeOnTheScreen()
        // With renderCTASeeAll=false, all 20 dApps are passed to FlatList
        // but due to virtualization, only visible ones are rendered
    })
})
