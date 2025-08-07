import React, { PropsWithChildren } from "react"
import { render, screen } from "@testing-library/react-native"
import { X2EAppsBottomSheet } from "./X2EAppsBottomSheet"
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

const mockUseX2ECategoryFiltering = jest.fn()
jest.mock("../Hooks/useX2ECategoryFiltering", () => ({
    useX2ECategoryFiltering: () => mockUseX2ECategoryFiltering(),
}))

jest.mock("../Hooks/useX2EAppAnimation", () => ({
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
        mockUseX2ECategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: mockApps,
        })
    })

    it("should render the bottom sheet component", () => {
        render(
            <Wrapper>
                <X2EAppsBottomSheet isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle loading state", () => {
        mockUseX2ECategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [],
        })

        render(
            <Wrapper>
                <X2EAppsBottomSheet isLoading={true} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle empty apps list", () => {
        mockUseX2ECategoryFiltering.mockReturnValue({
            selectedCategory: mockSelectedCategory,
            setSelectedCategory: mockSetSelectedCategory,
            filteredApps: [],
        })

        render(
            <Wrapper>
                <X2EAppsBottomSheet isLoading={false} allApps={[]} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should render apps when data is available", () => {
        render(
            <Wrapper>
                <X2EAppsBottomSheet isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getByText("Test App 1")).toBeTruthy()
        expect(screen.getByText("Test App 2")).toBeTruthy()
    })

    it("should handle forwardRef correctly", () => {
        const ref = React.createRef<any>()
        render(
            <Wrapper>
                <X2EAppsBottomSheet ref={ref} isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })

    it("should handle onDismiss prop", () => {
        const mockOnDismiss = jest.fn()
        render(
            <Wrapper>
                <X2EAppsBottomSheet onDismiss={mockOnDismiss} isLoading={false} allApps={mockApps} />
            </Wrapper>,
        )

        expect(screen.getAllByText("Food & Drink").length).toBeGreaterThan(0)
    })
})
