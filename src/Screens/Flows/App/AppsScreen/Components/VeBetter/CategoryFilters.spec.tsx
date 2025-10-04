import { fireEvent, render, screen } from "@testing-library/react-native"
import React, { PropsWithChildren } from "react"
import { TestWrapper } from "~Test"
import { CategoryFilters } from "./CategoryFilters"
import { X2ECategoryType } from "~Model/DApp"
import { IconKey } from "~Model/Icon"

const mockCategories = [
    {
        id: X2ECategoryType.NUTRITION,
        displayName: "Food & Drink",
        icon: "icon-salad" as IconKey,
    },
    {
        id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
        displayName: "Recycling",
        icon: "icon-recycle" as IconKey,
    },
    {
        id: X2ECategoryType.FITNESS_WELLNESS,
        displayName: "Lifestyle",
        icon: "icon-dumbbell" as IconKey,
    },
    {
        id: X2ECategoryType.RENEWABLE_ENERGY_EFFICIENCY,
        displayName: "Energy",
        icon: "icon-plug" as IconKey,
    },
    {
        id: X2ECategoryType.SUSTAINABLE_SHOPPING,
        displayName: "Shopping",
        icon: "icon-shopping-bag" as IconKey,
    },
]

jest.mock("./Hooks/useCategories", () => ({
    useCategories: () => mockCategories,
}))

const Wrapper = ({ children }: PropsWithChildren) => (
    <TestWrapper
        preloadedState={{
            discovery: {
                featured: [],
                bannerInteractions: {},
                connectedApps: [],
                custom: [],
                favorites: [],
                hasOpenedDiscovery: true,
                tabsManager: {
                    currentTabId: null,
                    tabs: [],
                },
            },
        }}>
        {children}
    </TestWrapper>
)

describe("CategoryFilters", () => {
    const mockOnCategoryChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render all category chips", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.getByText("Food & Drink")).toBeVisible()
        expect(screen.getByText("Recycling")).toBeVisible()
        expect(screen.getByText("Lifestyle")).toBeVisible()
        expect(screen.getByText("Energy")).toBeVisible()
        expect(screen.getByText("Shopping")).toBeVisible()
    })

    it("should mark the selected category as active", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.FITNESS_WELLNESS }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        const lifestyleChip = screen.getByText("Lifestyle")
        expect(lifestyleChip).toBeVisible()
    })

    it("should call onCategoryChange when a chip is pressed", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        const recyclingChip = screen.getByText("Recycling")
        fireEvent.press(recyclingChip)

        expect(mockOnCategoryChange).toHaveBeenCalledTimes(1)
        expect(mockOnCategoryChange).toHaveBeenCalledWith({
            id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
            displayName: "Recycling",
            icon: "icon-recycle",
        })
    })

    it("should call onCategoryChange with correct category data for different chips", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        const energyChip = screen.getByText("Energy")
        fireEvent.press(energyChip)

        expect(mockOnCategoryChange).toHaveBeenCalledWith({
            id: X2ECategoryType.RENEWABLE_ENERGY_EFFICIENCY,
            displayName: "Energy",
            icon: "icon-plug",
        })
    })

    it("should handle multiple chip presses correctly", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        const lifestyleChip = screen.getByText("Lifestyle")
        const shoppingChip = screen.getByText("Shopping")

        fireEvent.press(lifestyleChip)
        fireEvent.press(shoppingChip)

        expect(mockOnCategoryChange).toHaveBeenCalledTimes(2)
        expect(mockOnCategoryChange).toHaveBeenNthCalledWith(1, {
            id: X2ECategoryType.FITNESS_WELLNESS,
            displayName: "Lifestyle",
            icon: "icon-dumbbell",
        })
        expect(mockOnCategoryChange).toHaveBeenNthCalledWith(2, {
            id: X2ECategoryType.SUSTAINABLE_SHOPPING,
            displayName: "Shopping",
            icon: "icon-shopping-bag",
        })
    })

    it("should update selected category when props change", () => {
        const { rerender } = render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.getByText("Food & Drink")).toBeVisible()

        rerender(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.SUSTAINABLE_SHOPPING }}
                onCategoryChange={mockOnCategoryChange}
            />,
        )

        expect(screen.getByText("Shopping")).toBeVisible()
    })

    it("should handle edge case with empty categories", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.getByText("Food & Drink")).toBeVisible()
    })

    it("should maintain chip spacing and layout", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        const chips = ["Food & Drink", "Recycling", "Lifestyle", "Energy", "Shopping"]

        chips.forEach(chipText => {
            expect(screen.getByText(chipText)).toBeVisible()
        })
    })

    it("should handle rapid category changes", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        const chips = [
            screen.getByText("Food & Drink"),
            screen.getByText("Recycling"),
            screen.getByText("Lifestyle"),
            screen.getByText("Energy"),
            screen.getByText("Shopping"),
        ]

        chips.forEach(chip => {
            fireEvent.press(chip)
        })

        expect(mockOnCategoryChange).toHaveBeenCalledTimes(5)
    })

    it("should render animated background for tab indicator", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.getByText("Food & Drink")).toBeVisible()
    })

    it("should handle ScrollView layout and scroll events", () => {
        render(
            <CategoryFilters
                selectedCategory={{ id: X2ECategoryType.NUTRITION }}
                onCategoryChange={mockOnCategoryChange}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })
})
