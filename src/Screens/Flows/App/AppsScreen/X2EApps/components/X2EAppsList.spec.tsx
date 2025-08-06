import { render, screen } from "@testing-library/react-native"
import React, { PropsWithChildren } from "react"
import { TestWrapper } from "~Test"
import { X2EAppsList } from "./X2EAppsList"
import { X2ECategoryType } from "~Model/DApp"

jest.mock("../hooks/useX2EAppAnimation", () => ({
    useX2EAppAnimation: () => ({
        state: {
            showDetails: false,
            isAnimating: false,
            contentVisible: false,
        },
        handlers: {
            toggleDetails: jest.fn(),
            onPressIn: jest.fn(),
            onPressOut: jest.fn(),
        },
        styles: {
            containerStyle: {},
            fontStyle: {},
            imageStyle: {},
            detailsStyle: {},
        },
        animationProgress: { value: 0 },
    }),
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

describe("X2EAppsList", () => {
    const mockApps = [
        {
            id: "app-1",
            teamWalletAddress: "0x1234567890123456789012345678901234567890",
            name: "Test App 1",
            metadataURI: "https://example.com/metadata1.json",
            createdAtTimestamp: "1640995200",
            appAvailableForAllocationVoting: true,
            categories: [X2ECategoryType.NUTRITION],
            description: "A test X2E application 1",
            external_url: "https://example.com/app1",
            logo: "https://example.com/icon1.png",
            banner: "https://example.com/banner1.png",
            screenshots: ["https://example.com/screenshot1.png"],
            social_urls: [{ name: "twitter", url: "https://twitter.com/testapp1" }],
            app_urls: [{ code: "web", url: "https://example.com/app1" }],
            tweets: ["Great app for sustainability!"],
            ve_world: {
                banner: "https://example.com/veworld-banner1.png",
            },
        },
        {
            id: "app-2",
            teamWalletAddress: "0x2345678901234567890123456789012345678901",
            name: "Test App 2",
            metadataURI: "https://example.com/metadata2.json",
            createdAtTimestamp: "1640995201",
            appAvailableForAllocationVoting: false,
            categories: [X2ECategoryType.PLASTIC_WASTE_RECYCLING],
            description: "A test X2E application 2",
            external_url: "https://example.com/app2",
            logo: "https://example.com/icon2.png",
            banner: "https://example.com/banner2.png",
            screenshots: ["https://example.com/screenshot2.png"],
            social_urls: [{ name: "twitter", url: "https://twitter.com/testapp2" }],
            app_urls: [{ code: "web", url: "https://example.com/app2" }],
            tweets: ["Another great app!"],
            ve_world: {
                banner: "https://example.com/veworld-banner2.png",
            },
        },
    ]

    const mockOnDismiss = jest.fn()
    const mockOnToggleOpenItem = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render loading skeleton when isLoading is true", () => {
        render(
            <X2EAppsList
                apps={mockApps}
                isLoading={true}
                onDismiss={mockOnDismiss}
                openItemId={null}
                onToggleOpenItem={mockOnToggleOpenItem}
            />,
            { wrapper: Wrapper },
        )

        // Should render skeleton items instead of actual apps
        expect(screen.queryByText("Test App 1")).toBeNull()
        expect(screen.queryByText("Test App 2")).toBeNull()
    })

    it("should render apps when isLoading is false", () => {
        render(
            <X2EAppsList
                apps={mockApps}
                isLoading={false}
                onDismiss={mockOnDismiss}
                openItemId={null}
                onToggleOpenItem={mockOnToggleOpenItem}
            />,
            { wrapper: Wrapper },
        )

        // Should render actual app items
        expect(screen.getByText("Test App 1")).toBeVisible()
        expect(screen.getByText("Test App 2")).toBeVisible()
        expect(screen.getByText("A test X2E application 1")).toBeVisible()
        expect(screen.getByText("A test X2E application 2")).toBeVisible()
    })

    it("should render empty list when no apps are provided", () => {
        render(
            <X2EAppsList
                apps={[]}
                isLoading={false}
                onDismiss={mockOnDismiss}
                openItemId={null}
                onToggleOpenItem={mockOnToggleOpenItem}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.queryByText("Test App 1")).toBeNull()
        expect(screen.queryByText("Test App 2")).toBeNull()
    })

    it("should render with optional onDismiss prop", () => {
        render(
            <X2EAppsList apps={mockApps} isLoading={false} openItemId={null} onToggleOpenItem={mockOnToggleOpenItem} />,
            { wrapper: Wrapper },
        )

        expect(screen.getByText("Test App 1")).toBeVisible()
        expect(screen.getByText("Test App 2")).toBeVisible()
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

        render(
            <X2EAppsList
                apps={minimalApps}
                isLoading={false}
                onDismiss={mockOnDismiss}
                openItemId={null}
                onToggleOpenItem={mockOnToggleOpenItem}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.getByText("Minimal App")).toBeVisible()
        expect(screen.getByText("Minimal description")).toBeVisible()
    })
})
