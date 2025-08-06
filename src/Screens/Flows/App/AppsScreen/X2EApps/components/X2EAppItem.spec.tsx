import { render, screen } from "@testing-library/react-native"
import React, { PropsWithChildren } from "react"
import { TestWrapper } from "~Test"
import { X2EAppItem } from "./X2EAppItem"
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

// Mock the useX2ECategories hook
const mockCategories = [
    {
        id: X2ECategoryType.NUTRITION,
        displayName: "Food & Drink",
        icon: "icon-salad",
    },
    {
        id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
        displayName: "Recycling",
        icon: "icon-recycle",
    },
]

jest.mock("../hooks/useX2ECategories", () => ({
    useX2ECategories: () => mockCategories,
}))

// Mock the useDappBookmarking hook
jest.mock("~Hooks/useDappBookmarking", () => ({
    useDappBookmarking: () => ({
        isBookMarked: false,
        toggleBookmark: jest.fn(),
    }),
}))

// Mock the useAnalyticTracking hook
jest.mock("~Hooks/useAnalyticTracking", () => ({
    useAnalyticTracking: () => jest.fn(),
}))

// Mock the URIUtils
jest.mock("~Utils", () => ({
    ...jest.requireActual("~Utils"),
    URIUtils: {
        convertUriToUrl: jest.fn(uri => `converted-${uri}`),
    },
    PlatformUtils: {
        isAndroid: jest.fn(() => false),
        isIOS: jest.fn(() => true),
    },
}))

// Mock the animation hook to avoid Reanimated issues
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

describe("X2EAppItem", () => {
    const mockDapp = {
        id: "test-app-1",
        teamWalletAddress: "0x1234567890123456789012345678901234567890",
        name: "Test X2E App",
        metadataURI: "https://example.com/metadata.json",
        createdAtTimestamp: "1640995200",
        appAvailableForAllocationVoting: true,
        categories: [X2ECategoryType.NUTRITION],
        description: "A test X2E application",
        external_url: "https://example.com/app",
        logo: "https://example.com/icon.png",
        banner: "https://example.com/banner.png",
        screenshots: ["https://example.com/screenshot1.png"],
        social_urls: [{ name: "twitter", url: "https://twitter.com/testapp" }],
        app_urls: [{ code: "web", url: "https://example.com/app" }],
        tweets: ["Great app for sustainability!"],
        ve_world: {
            banner: "https://example.com/veworld-banner.png",
        },
    }

    const mockOnDismiss = jest.fn()
    const mockOnToggleOpenItem = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render the app item correctly", () => {
        render(
            <X2EAppItem
                dapp={mockDapp}
                onDismiss={mockOnDismiss}
                openItemId={null}
                onToggleOpenItem={mockOnToggleOpenItem}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.getByText("Test X2E App")).toBeVisible()
        expect(screen.getByText("A test X2E application")).toBeVisible()
    })

    it("should handle app without category", () => {
        const appWithoutCategory = {
            ...mockDapp,
            categories: undefined,
        }

        render(
            <X2EAppItem
                dapp={appWithoutCategory}
                onDismiss={mockOnDismiss}
                openItemId={null}
                onToggleOpenItem={mockOnToggleOpenItem}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.queryByText("Food & Drink")).toBeNull()
    })

    it("should handle app with minimal metadata", () => {
        const appWithMinimalMetadata = {
            ...mockDapp,
            description: "Minimal description",
            external_url: "https://example.com",
            logo: "https://example.com/logo.png",
            banner: "https://example.com/banner.png",
            screenshots: [],
            social_urls: [],
            app_urls: [],
            tweets: [],
            ve_world: undefined,
        }

        render(
            <X2EAppItem
                dapp={appWithMinimalMetadata}
                onDismiss={mockOnDismiss}
                openItemId={null}
                onToggleOpenItem={mockOnToggleOpenItem}
            />,
            { wrapper: Wrapper },
        )

        expect(screen.getByText("Test X2E App")).toBeVisible()
    })
})
