import { render, screen } from "@testing-library/react-native"
import React, { PropsWithChildren } from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { useVeBetterDaoActiveDapps } from "~Hooks"
import { X2ECategoryType } from "~Model/DApp"
import { AppsBottomSheet } from "./AppsBottomSheet"

jest.mock("react-native-reanimated", () => {
    const Reanimated = require("react-native-reanimated/mock")

    Reanimated.useSharedValue = jest.fn(() => ({ value: 0 }))
    Reanimated.useAnimatedStyle = jest.fn(() => ({}))
    Reanimated.withTiming = jest.fn(value => value)
    Reanimated.Easing = {
        out: jest.fn(() => jest.fn()),
        quad: jest.fn(() => jest.fn()),
        inOut: jest.fn(() => jest.fn()),
        bezier: jest.fn(() => jest.fn()),
    }
    Reanimated.runOnJS = jest.fn(fn => fn)
    Reanimated.useReducedMotion = jest.fn(() => false)

    return Reanimated
})

jest.mock("react-native", () => {
    const RN = jest.requireActual("react-native")
    return {
        ...RN,
        Dimensions: {
            get: jest.fn(() => ({ width: 375, height: 812 })),
        },
    }
})

const Wrapper = ({ children }: PropsWithChildren) => (
    <TestWrapper
        preloadedState={{
            discovery: {
                featured: [],
                favoriteRefs: [],
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

const mockUseCategoryFiltering = jest.fn()
jest.mock("./Hooks/useCategoryFiltering", () => ({
    useCategoryFiltering: () => mockUseCategoryFiltering(),
}))

jest.mock("./Hooks/useCategories", () => ({
    useCategories: () => [
        {
            id: "NUTRITION",
            displayName: "Food & Drink",
            icon: "icon-salad",
        },
        {
            id: "PLASTIC_WASTE_RECYCLING",
            displayName: "Recycling",
            icon: "icon-recycle",
        },
    ],
}))

jest.mock("./Hooks/useX2EAppAnimation", () => ({
    useX2EAppAnimation: () => ({
        state: { showDetails: false, isAnimating: false, contentVisible: false },
        handlers: { toggleDetails: jest.fn(), onPressIn: jest.fn(), onPressOut: jest.fn() },
        styles: { containerStyle: {}, fontStyle: {}, imageStyle: {}, detailsStyle: {} },
        animationProgress: { value: 0 },
    }),
}))

jest.mock("~Hooks/useFetchFeaturedDApps/useVeBetterDaoActiveApps", () => ({
    useVeBetterDaoActiveDapps: jest.fn().mockReturnValue({
        data: [],
        isLoading: false,
    }),
}))

describe("X2EAppsBottomSheet", () => {
    const mockApps = [TestHelpers.data.mockApp1, TestHelpers.data.mockApp2]
    const mockSelectedCategory = {
        id: X2ECategoryType.NUTRITION,
        displayName: "Food & Drink",
        icon: "icon-salad",
    }

    const mockSetSelectedCategory = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: mockApps,
        })
    })

    it("should render the bottom sheet component", () => {
        render(<AppsBottomSheet />, { wrapper: Wrapper })

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle loading state", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockApps,
            isLoading: true,
        })
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [],
        })

        render(<AppsBottomSheet />, { wrapper: Wrapper })

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle empty apps list", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [],
        })

        render(<AppsBottomSheet />, { wrapper: Wrapper })

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should render apps when data is available", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockApps,
            isLoading: false,
        })
        render(<AppsBottomSheet />, { wrapper: Wrapper })

        expect(screen.getByText("A App")).toBeTruthy()
        expect(screen.getByText("B App")).toBeTruthy()
    })

    it("should handle forwardRef correctly", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockApps,
            isLoading: false,
        })
        const ref = React.createRef<any>()
        render(<AppsBottomSheet ref={ref} />, { wrapper: Wrapper })

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle onDismiss prop", () => {
        const mockOnDismiss = jest.fn()
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockApps,
            isLoading: false,
        })
        render(<AppsBottomSheet onDismiss={mockOnDismiss} />, { wrapper: Wrapper })

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should render loading skeleton when isLoading is true", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockApps,
            isLoading: true,
        })
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: mockApps,
        })

        render(<AppsBottomSheet />, { wrapper: Wrapper })

        expect(screen.queryByText("A App")).toBeNull()
        expect(screen.queryByText("B App")).toBeNull()
    })

    it("should render apps when isLoading is false", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockApps,
            isLoading: false,
        })
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: mockApps,
        })

        render(<AppsBottomSheet />, { wrapper: Wrapper })

        expect(screen.getByText("A App")).toBeVisible()
        expect(screen.getByText("B App")).toBeVisible()
        expect(screen.getByText("A nutrition app")).toBeVisible()
        expect(screen.getByText("A recycling app")).toBeVisible()
    })

    it("should render empty list when no apps are provided", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [],
        })

        render(<AppsBottomSheet />, { wrapper: Wrapper })

        expect(screen.queryByText("A App")).toBeNull()
        expect(screen.queryByText("B App")).toBeNull()
    })

    it("should handle apps with minimal data", () => {
        const minimalApps = [
            {
                id: "minimal-app",
                teamWalletAddress: "0x1234567890123456789012345678901234567890",
                name: "Minimal App",
                metadataURI: "https://example.com/metadata.json",
                createdAtTimestamp: "1640995200",
                description: "Minimal description",
                external_url: "https://example.com",
                logo: "https://example.com/logo.png",
                banner: "https://example.com/banner.png",
                screenshots: [],
                social_urls: [],
                app_urls: [],
                tweets: [],
                ve_world: undefined,
            },
        ]
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: minimalApps,
            isLoading: false,
        })

        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: minimalApps,
        })

        render(<AppsBottomSheet />, { wrapper: Wrapper })

        expect(screen.getByText("Minimal App")).toBeVisible()
        expect(screen.getByText("Minimal description")).toBeVisible()
    })

    it("should handle different category selections", () => {
        const recyclingCategory = {
            id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
            displayName: "Recycling",
            icon: "icon-recycle",
        }

        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: recyclingCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [mockApps[1]],
        })
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockApps,
            isLoading: false,
        })

        render(<AppsBottomSheet />, { wrapper: Wrapper })

        expect(screen.getAllByText("Recycling").length).toBeGreaterThan(0)
        expect(screen.getByText("B App")).toBeVisible()
        expect(screen.queryByText("A App")).toBeNull()
    })

    it("should handle initial category ID prop", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockApps,
            isLoading: false,
        })

        render(<AppsBottomSheet initialCategoryId={X2ECategoryType.NUTRITION} />, { wrapper: Wrapper })

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle animation direction state changes", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockApps,
            isLoading: false,
        })

        const { rerender } = render(<AppsBottomSheet />, { wrapper: Wrapper })

        const newCategory = {
            id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
            displayName: "Recycling",
            icon: "icon-recycle",
        }

        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: newCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [mockApps[1]],
        })

        rerender(<AppsBottomSheet />)

        expect(screen.getAllByText("Recycling").length).toBeGreaterThan(0)
    })
})
