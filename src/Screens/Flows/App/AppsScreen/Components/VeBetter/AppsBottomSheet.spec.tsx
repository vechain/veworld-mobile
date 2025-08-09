import React, { PropsWithChildren } from "react"
import { render, screen } from "@testing-library/react-native"
import { AppsBottomSheet } from "./AppsBottomSheet"
import { TestWrapper } from "~Test"
import { X2ECategoryType } from "~Model/DApp"

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

const mockUseCategoryFiltering = jest.fn()
jest.mock("./Hooks/useCategoryFiltering", () => ({
    useCategoryFiltering: () => mockUseCategoryFiltering(),
}))

jest.mock("./Hooks/useX2EAppAnimation", () => ({
    useX2EAppAnimation: () => ({
        state: { showDetails: false, isAnimating: false, contentVisible: false },
        handlers: { toggleDetails: jest.fn(), onPressIn: jest.fn(), onPressOut: jest.fn() },
        styles: { containerStyle: {}, fontStyle: {}, imageStyle: {}, detailsStyle: {} },
        animationProgress: { value: 0 },
    }),
}))

describe("X2EAppsBottomSheet", () => {
    const mockApps = [
        {
            id: "app-1",
            teamWalletAddress: "0x1234567890123456789012345678901234567890",
            name: "Test App 1",
            metadataURI: "https://example.com/metadata1.json",
            createdAtTimestamp: "1640995200",
            appAvailableForAllocationVoting: true,
            categories: [X2ECategoryType.NUTRITION],
            description: "A test app",
            external_url: "https://example.com/app1",
            logo: "https://example.com/icon1.png",
            banner: "https://example.com/banner1.png",
            screenshots: ["https://example.com/screenshot1.png"],
            social_urls: [{ name: "twitter", url: "https://twitter.com/app1" }],
            app_urls: [{ code: "web", url: "https://example.com/app1" }],
            tweets: ["Great app!"],
            ve_world: { banner: "https://example.com/veworld-banner1.png" },
        },
        {
            id: "app-2",
            teamWalletAddress: "0x2345678901234567890123456789012345678901",
            name: "Test App 2",
            metadataURI: "https://example.com/metadata2.json",
            createdAtTimestamp: "1640995201",
            appAvailableForAllocationVoting: false,
            categories: [X2ECategoryType.PLASTIC_WASTE_RECYCLING],
            description: "Another test app",
            external_url: "https://example.com/app2",
            logo: "https://example.com/icon2.png",
            banner: "https://example.com/banner2.png",
            screenshots: ["https://example.com/screenshot2.png"],
            social_urls: [{ name: "twitter", url: "https://twitter.com/app2" }],
            app_urls: [{ code: "web", url: "https://example.com/app2" }],
            tweets: ["Another great app!"],
            ve_world: { banner: "https://example.com/veworld-banner2.png" },
        },
    ]

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
        render(
            <Wrapper>
                <AppsBottomSheet isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle loading state", () => {
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [],
        })

        render(
            <Wrapper>
                <AppsBottomSheet isLoading={true} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle empty apps list", () => {
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [],
        })

        render(
            <Wrapper>
                <AppsBottomSheet isLoading={false} allApps={[]} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should render apps when data is available", () => {
        render(
            <Wrapper>
                <AppsBottomSheet isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getByText("Test App 1")).toBeTruthy()
        expect(screen.getByText("Test App 2")).toBeTruthy()
    })

    it("should handle forwardRef correctly", () => {
        const ref = React.createRef<any>()
        render(
            <Wrapper>
                <AppsBottomSheet ref={ref} isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle onDismiss prop", () => {
        const mockOnDismiss = jest.fn()
        render(
            <Wrapper>
                <AppsBottomSheet onDismiss={mockOnDismiss} isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should render loading skeleton when isLoading is true", () => {
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: mockApps,
        })

        render(
            <Wrapper>
                <AppsBottomSheet isLoading={true} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.queryByText("Test App 1")).toBeNull()
        expect(screen.queryByText("Test App 2")).toBeNull()
    })

    it("should render apps when isLoading is false", () => {
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: mockApps,
        })

        render(
            <Wrapper>
                <AppsBottomSheet isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getByText("Test App 1")).toBeVisible()
        expect(screen.getByText("Test App 2")).toBeVisible()
        expect(screen.getByText("A test app")).toBeVisible()
        expect(screen.getByText("Another test app")).toBeVisible()
    })

    it("should render empty list when no apps are provided", () => {
        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [],
        })

        render(
            <Wrapper>
                <AppsBottomSheet isLoading={false} allApps={[]} />
            </Wrapper>,
        )

        expect(screen.queryByText("Test App 1")).toBeNull()
        expect(screen.queryByText("Test App 2")).toBeNull()
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

        mockUseCategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: minimalApps,
        })

        render(
            <Wrapper>
                <AppsBottomSheet isLoading={false} allApps={minimalApps} />
            </Wrapper>,
        )

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

        render(
            <Wrapper>
                <AppsBottomSheet isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Recycling").length).toBeGreaterThan(0)
        expect(screen.getByText("Test App 2")).toBeVisible()
        expect(screen.queryByText("Test App 1")).toBeNull()
    })
})
